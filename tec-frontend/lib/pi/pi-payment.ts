import { getAccessToken, waitForPiSDK } from './pi-auth';
import {
  APPROVAL_TIMEOUT_MS,
  COMPLETION_TIMEOUT_MS,
  RETRIABLE_STATUS_CODES,
  NON_RETRIABLE_STATUS_CODES,
  MAX_RETRIES,
  RETRY_BASE_DELAY_MS,
} from './payment-timeouts';

export interface A2UPaymentRequest {
  recipientUid: string;
  amount: number;
  memo: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  txid?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'failed';
  amount: number;
  memo: string;
  message?: string;
}

// Retry helper function
const retryFetch = async (
  url: string,
  options: RequestInit,
  maxRetries = MAX_RETRIES
): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      // Non-retriable status codes: return immediately without retrying
      if (NON_RETRIABLE_STATUS_CODES.has(response.status)) {
        return response;
      }
      
      // Retriable status codes (e.g. 404 = payment not yet indexed, 429 = rate limited)
      // Retry with exponential back-off unless this is the last attempt
      if (RETRIABLE_STATUS_CODES.has(response.status) && i < maxRetries) {
        const delay = RETRY_BASE_DELAY_MS * (i + 1);
        console.warn(`[Pi Payment] Retriable HTTP ${response.status} on attempt ${i + 1}/${maxRetries + 1}, retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Unknown error');
      if (i < maxRetries) {
        // Wait before retry (exponential backoff: 1s, 2s)
        await new Promise(resolve => setTimeout(resolve, RETRY_BASE_DELAY_MS * (i + 1)));
      }
    }
  }
  
  throw lastError || new Error('Request failed');
};

// Create App-to-User payment (server-side initiated)
export const createA2UPayment = async (data: A2UPaymentRequest): Promise<PaymentResult> => {
  const token = getAccessToken();
  if (!token) throw new Error('غير مصرح — سجل الدخول أولاً / Unauthorized - Please log in first');

  try {
    // [source: Core-Backend]
    const response = await retryFetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/payments/a2u`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || 'فشل إنشاء الدفعة / Failed to create payment');
    }

    return response.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'فشل إنشاء الدفعة / Failed to create payment';
    throw new Error(message);
  }
};

// Diagnostic callback type
export type DiagnosticCallback = (type: string, message: string, data?: unknown) => void;

// User-to-App payment using Pi SDK (client-side)
export const createU2APayment = async (
  amount: number,
  memo: string,
  metadata: Record<string, unknown> = {},
  onDiagnostic?: DiagnosticCallback
): Promise<PaymentResult> => {
  if (typeof window === 'undefined') {
    throw new Error('Pi SDK غير متاح — افتح التطبيق في Pi Browser / Pi SDK not available - Open in Pi Browser');
  }

  // Wait for Pi SDK to be ready before attempting payment
  await waitForPiSDK();

  return new Promise((resolve, reject) => {
    if (!window.Pi) {
      reject(new Error('Pi SDK غير متاح — افتح التطبيق في Pi Browser / Pi SDK not available - Open in Pi Browser'));
      return;
    }

    // Payment timeout: Separate timeouts for approval and completion stages.
    // Values come from the centralized payment-timeouts.ts configuration.
    // Approval: configurable via NEXT_PUBLIC_PI_APPROVAL_TIMEOUT (default 3 min)
    // Completion: configurable via NEXT_PUBLIC_PI_COMPLETION_TIMEOUT (default 3 min)
    // Total: up to 6 minutes — each stage has dedicated time.
    const approvalTimeoutMs = APPROVAL_TIMEOUT_MS;
    const completionTimeoutMs = COMPLETION_TIMEOUT_MS;
    
    let paymentTimedOut = false;
    let paymentTimer: NodeJS.Timeout | null = null;
    
    const startApprovalTimer = () => {
      // Clear any existing timer first
      if (paymentTimer) {
        clearTimeout(paymentTimer);
      }
      console.log(`[Pi Payment] Starting approval timeout: ${approvalTimeoutMs}ms`);
      paymentTimer = setTimeout(() => {
        paymentTimedOut = true;
        console.error(`[Pi Payment] Approval stage timed out after ${approvalTimeoutMs}ms`);
        reject(new Error(
          'انتهت مهلة موافقة الدفع. يرجى المحاولة مرة أخرى.\n' +
          'Payment approval timed out. Please try again.'
        ));
      }, approvalTimeoutMs);
    };
    
    const startCompletionTimer = () => {
      // Clear existing timer
      if (paymentTimer) {
        clearTimeout(paymentTimer);
      }
      console.log(`[Pi Payment] Starting completion timeout: ${completionTimeoutMs}ms`);
      paymentTimer = setTimeout(() => {
        paymentTimedOut = true;
        console.error(`[Pi Payment] Completion stage timed out after ${completionTimeoutMs}ms`);
        reject(new Error(
          'انتهت مهلة إكمال الدفع. يرجى المحاولة مرة أخرى.\n' +
          'Payment completion timed out. Please try again.'
        ));
      }, completionTimeoutMs);
    };

    // Helper to clear timeout
    const clearPaymentTimer = () => {
      if (paymentTimer) {
        clearTimeout(paymentTimer);
        paymentTimer = null;
      }
    };
    
    // Start approval timer
    startApprovalTimer();

    window.Pi.createPayment(
      { amount, memo, metadata },
      {
        onReadyForServerApproval: async (paymentId: string) => {
          if (paymentTimedOut) return;

          // Log diagnostic event
          onDiagnostic?.('approval', `Server approval requested for payment: ${paymentId}`, { paymentId });

          // Validate paymentId format before sending to server
          const paymentIdRegex = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$/;
          if (!paymentIdRegex.test(paymentId)) {
            console.error('[Pi Payment] Invalid paymentId format:', paymentId);
            onDiagnostic?.('error', `Invalid paymentId format: ${paymentId}`, { paymentId });
            clearPaymentTimer();
            reject(new Error(
              'معرف الدفع غير صالح / Invalid payment ID format'
            ));
            return;
          }

          try {
            console.log('[Pi Payment] Server approval requested for:', paymentId);
            // [source: Core-Backend]
            const res = await retryFetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/payments/approve`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({ message: 'Approval failed' }));
              const errorMsg = errorData.message || 'فشلت الموافقة / Approval failed';
              console.error('[Pi Payment] Server approval failed:', errorMsg);
              console.warn('[Pi Payment] Incomplete payment may remain:', paymentId);
              onDiagnostic?.('error', `Server approval failed: ${errorMsg}`, { paymentId, error: errorMsg });
              clearPaymentTimer();
              reject(new Error(errorMsg));
              return;
            }
            
            const result = await res.json();
            console.log('[Pi Payment] Server approval successful:', result);
            onDiagnostic?.('approval', `Server approval successful for payment: ${paymentId}`, { paymentId, result });
            
            // Switch to completion timer after successful approval
            startCompletionTimer();
          } catch (err) {
            console.error('[Pi Payment] Server approval error:', err);
            console.warn('[Pi Payment] Incomplete payment may remain:', paymentId);
            const errorMessage = err instanceof Error ? err.message : 'فشلت الموافقة / Approval failed';
            onDiagnostic?.('error', `Server approval error: ${errorMessage}`, { paymentId, error: errorMessage });
            clearPaymentTimer();
            reject(new Error(errorMessage));
          }
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          if (paymentTimedOut) return;

          // Log diagnostic event
          onDiagnostic?.('completion', `Server completion requested for payment: ${paymentId}`, { paymentId, txid });

          // Validate paymentId format before sending to server
          const paymentIdRegex = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$/;
          if (!paymentIdRegex.test(paymentId)) {
            console.error('[Pi Payment] Invalid paymentId format in completion:', paymentId);
            onDiagnostic?.('error', `Invalid paymentId format in completion: ${paymentId}`, { paymentId });
            clearPaymentTimer();
            reject(new Error(
              'معرف الدفع غير صالح / Invalid payment ID format'
            ));
            return;
          }

          // Validate txid format (accept Pi testnet/mainnet IDs without allowing path separators)
          const txidRegex = /^[a-zA-Z0-9_-]{8,128}$/;
          if (!txidRegex.test(txid)) {
            console.error('[Pi Payment] Invalid txid format:', txid);
            onDiagnostic?.('error', `Invalid txid format: ${txid}`, { txid });
            clearPaymentTimer();
            reject(new Error(
              'معرف المعاملة غير صالح / Invalid transaction ID format'
            ));
            return;
          }

          try {
            console.log('[Pi Payment] Server completion requested for:', paymentId, txid);
            // [source: Core-Backend]
            const res = await retryFetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/payments/complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({ message: 'Completion failed' }));
              const errorMsg = errorData.message || 'فشل الإكمال / Completion failed';
              console.error('[Pi Payment] Server completion failed:', errorMsg);
              onDiagnostic?.('error', `Server completion failed: ${errorMsg}`, { paymentId, txid, error: errorMsg });
              clearPaymentTimer();
              reject(new Error(errorMsg));
              return;
            }
            
            const result = await res.json();
            console.log('[Pi Payment] Server completion successful:', result);
            onDiagnostic?.('completion', `Server completion successful for payment: ${paymentId}`, { paymentId, txid, result });
            
            clearPaymentTimer();
            resolve({
              success: true,
              paymentId,
              txid,
              status: 'completed',
              amount,
              memo,
              message: 'تمت الدفعة بنجاح! 🎉 / Payment successful! 🎉',
              ...result,
            });
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'فشلت الدفعة / Payment failed';
            onDiagnostic?.('error', `Server completion error: ${errorMessage}`, { paymentId, txid, error: errorMessage });
            clearPaymentTimer();
            reject(new Error(errorMessage));
          }
        },
        onCancel: () => {
          console.log('[Pi Payment] Payment cancelled by user');
          onDiagnostic?.('cancel', 'Payment cancelled by user');
          clearPaymentTimer();
          resolve({
            success: false,
            status: 'cancelled',
            amount,
            memo,
            message: 'ألغيت الدفعة / Payment cancelled',
          });
        },
        onError: (error: Error) => {
          console.error('[Pi Payment] SDK error:', error);
          onDiagnostic?.('error', `Pi SDK error: ${error.message}`, { error: error.message });
          clearPaymentTimer();
          reject(new Error(`خطأ Pi SDK / Pi SDK error: ${error.message}`));
        },
      }
    );
  });
};

// Get payment status from server
export const getPaymentStatus = async (paymentId: string): Promise<PaymentResult> => {
  try {
    // [source: Core-Backend]
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/payments/${encodeURIComponent(paymentId)}/status`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || 'فشل جلب حالة الدفعة / Failed to fetch payment status');
    }
    
    return response.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'فشل جلب حالة الدفعة / Failed to fetch payment status';
    throw new Error(message);
  }
};

// Test Pi SDK connectivity
export const testPiSDK = (): boolean => {
  if (typeof window === 'undefined') return false;
  const available = typeof window.Pi !== 'undefined';
  console.log('Pi SDK available:', available);
  if (available) {
    console.log('Pi SDK object:', window.Pi);
  }
  return available;
};
