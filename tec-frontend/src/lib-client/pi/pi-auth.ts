import { PiAuthResult, TecAuthResponse, PiPaymentData, PiPaymentCallbacks } from '@/types/pi.types';

declare global {
  interface Window {
    Pi: {
      authenticate: (
        scopes: string[],
        onIncompletePayment: (payment: unknown) => void
      ) => Promise<PiAuthResult>;
      createPayment: (paymentData: PiPaymentData, callbacks: PiPaymentCallbacks) => void;
      init: (config: { version: string; sandbox: boolean; appId?: string }) => void;
    };
    __PI_SANDBOX?: boolean;
    __TEC_PI_READY?: boolean;
    __TEC_PI_ERROR?: boolean;
  }
}

/* =========================================================
   Error Messages
========================================================= */

const ERRORS = {
  NOT_PI_BROWSER:
    'Please open the app inside Pi Browser to authenticate.\n' +
    'Instructions: Open Pi Network app → Apps → TEC App',
  SDK_LOAD_FAILED:
    'Pi SDK failed to load. Please check your internet connection and try again.',
  SDK_INIT_FAILED:
    'Pi SDK initialization failed. Please try again.',
  AUTH_TIMEOUT:
    'Authentication timed out. Please check your internet connection and try again.',
  SAVE_FAILED:
    'Failed to save authentication data. Please ensure private browsing mode is disabled.',
};

/* =========================================================
   Browser Detection
========================================================= */

export const isPiBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  return typeof window.Pi !== 'undefined' && typeof window.Pi.authenticate === 'function';
};

/* =========================================================
   Token Storage
========================================================= */

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('tec_access_token');
  } catch (err) {
    console.error('[Pi Auth] Failed to read from localStorage:', err);
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('tec_refresh_token');
  } catch (err) {
    console.error('[Pi Auth] Failed to read from localStorage:', err);
    return null;
  }
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem('tec_user');
    return userData ? JSON.parse(userData) : null;
  } catch (err) {
    console.error('[Pi Auth] Failed to read from localStorage:', err);
    return null;
  }
};

export const logout = () => {
  try {
    localStorage.removeItem('tec_access_token');
    localStorage.removeItem('tec_refresh_token');
    localStorage.removeItem('tec_user');
  } catch (err) {
    console.error('[Pi Auth] Failed to clear localStorage:', err);
  }
};

/* =========================================================
   Refresh Access Token
========================================================= */

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.warn('[Pi Auth] No refresh token available');
    logout();
    return null;
  }

  // If already refreshing, queue the request
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
    const res = await fetch(`${gatewayUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      console.warn('[Pi Auth] Refresh token failed, logging out');
      logout();
      refreshQueue.forEach((cb) => cb(null));
      refreshQueue = [];
      return null;
    }

    const raw = await res.json();
    const envelope = raw.data ?? raw;
    const newAccessToken: string = envelope.tokens?.accessToken ?? envelope.accessToken ?? '';

    if (!newAccessToken) {
      console.warn('[Pi Auth] No access token in refresh response');
      logout();
      refreshQueue.forEach((cb) => cb(null));
      refreshQueue = [];
      return null;
    }

    // Save new tokens
    try {
      localStorage.setItem('tec_access_token', newAccessToken);
      if (envelope.tokens?.refreshToken) {
        localStorage.setItem('tec_refresh_token', envelope.tokens.refreshToken);
      }
    } catch (err) {
      console.error('[Pi Auth] Failed to save refreshed token:', err);
    }

    console.log('[Pi Auth] Token refreshed successfully');
    refreshQueue.forEach((cb) => cb(newAccessToken));
    refreshQueue = [];
    return newAccessToken;

  } catch (err) {
    console.error('[Pi Auth] Refresh request failed:', err);
    logout();
    refreshQueue.forEach((cb) => cb(null));
    refreshQueue = [];
    return null;
  } finally {
    isRefreshing = false;
  }
};

/* =========================================================
   Fetch with Auto Refresh (use this instead of raw fetch)
========================================================= */

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {

  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers });

  // If 401 → try to refresh token and retry once
  if (res.status === 401) {
    console.warn('[Pi Auth] Got 401, attempting token refresh...');
    const newToken = await refreshAccessToken();

    if (!newToken) {
      console.warn('[Pi Auth] Refresh failed, user needs to login again');
      return res;
    }

    const retryHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> ?? {}),
      Authorization: `Bearer ${newToken}`,
    };

    return fetch(url, { ...options, headers: retryHeaders });
  }

  return res;
};

/* =========================================================
   Resolve Incomplete Payment
========================================================= */

export const resolvePendingPayment = async (
  piPaymentId: string
): Promise<{ action: string } | null> => {
  const token = getAccessToken();
  const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

  if (!token) {
    console.warn('[Pi Auth] No access token, cannot resolve pending payment');
    return null;
  }

  if (!gatewayUrl) {
    console.warn('[Pi Auth] No gateway URL configured, cannot resolve pending payment');
    return null;
  }

  try {
    console.log('[Pi Auth] Calling /payments/resolve-incomplete for:', piPaymentId);
    const res = await fetchWithAuth(`${gatewayUrl}/api/payments/resolve-incomplete`, {
      method: 'POST',
      body: JSON.stringify({ pi_payment_id: piPaymentId }),
    });

    if (res.ok) {
      const data = await res.json();
      const action = data?.data?.action ?? data?.action ?? 'resolved';
      console.log('[Pi Auth] Pending payment resolved:', action);
      return { action };
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.warn('[Pi Auth] Failed to resolve pending payment:', res.status, errorData);
      return null;
    }
  } catch (err) {
    console.error('[Pi Auth] Error resolving pending payment:', err);
    return null;
  }
};

const resolveIncompletePayment = async (payment: unknown) => {
  console.warn('[Pi Auth] Incomplete payment detected:', payment);
  const p = payment as { identifier?: string };
  const piPaymentId = p?.identifier;
  if (!piPaymentId) {
    console.error('[Pi Auth] Incomplete payment has no identifier, cannot resolve');
    return;
  }
  const result = await resolvePendingPayment(piPaymentId);
  if (result) {
    console.log('[Pi Auth] Incomplete payment resolved with action:', result.action);
  } else {
    console.warn('[Pi Auth] Could not resolve incomplete payment — Pi SDK will expire it');
  }
};

const handleIncompletePayment = (payment: unknown) => {
  void resolveIncompletePayment(payment);
};

/* =========================================================
   Wait for Pi SDK
========================================================= */

export const waitForPiSDK = (timeout = 15000): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.__TEC_PI_ERROR) {
      reject(new Error(ERRORS.SDK_LOAD_FAILED));
      return;
    }

    if (typeof window !== 'undefined' && typeof window.Pi !== 'undefined' && window.__TEC_PI_READY) {
      console.log('[Pi Auth] Pi SDK already ready');
      resolve();
      return;
    }

    const startTime = Date.now();
    console.log(`[Pi Auth] Waiting for Pi SDK (timeout: ${timeout}ms)...`);

    const timer = setTimeout(() => {
      window.removeEventListener('tec-pi-ready', onReady);
      window.removeEventListener('tec-pi-error', onError);
      const elapsed = Date.now() - startTime;
      console.error(`[Pi Auth] Pi SDK wait timeout after ${elapsed}ms`);
      reject(new Error(ERRORS.SDK_LOAD_FAILED));
    }, timeout);

    const onReady = () => {
      const elapsed = Date.now() - startTime;
      console.log(`[Pi Auth] Pi SDK ready after ${elapsed}ms`);
      clearTimeout(timer);
      window.removeEventListener('tec-pi-error', onError);
      resolve();
    };

    const onError = (event: Event) => {
      const elapsed = Date.now() - startTime;
      const detail = (event as CustomEvent).detail;
      console.error(`[Pi Auth] Pi SDK init error after ${elapsed}ms:`, detail);
      clearTimeout(timer);
      window.removeEventListener('tec-pi-ready', onReady);
      reject(new Error(ERRORS.SDK_INIT_FAILED));
    };

    window.addEventListener('tec-pi-ready', onReady, { once: true });
    window.addEventListener('tec-pi-error', onError, { once: true });
  });
};

/* =========================================================
   Authenticate with Timeout
========================================================= */

const getAuthTimeout = (): number => {
  const envTimeout = process.env.NEXT_PUBLIC_PI_AUTH_TIMEOUT
    ? parseInt(process.env.NEXT_PUBLIC_PI_AUTH_TIMEOUT, 10)
    : 45000;
  if (!isNaN(envTimeout) && envTimeout > 0 && envTimeout < 120000) return envTimeout;
  return 45000;
};

const authenticateWithTimeout = async (timeout?: number): Promise<PiAuthResult> => {
  const effectiveTimeout = timeout ?? getAuthTimeout();
  await waitForPiSDK();

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    console.log('[Pi Auth] Starting authentication...');
    console.log('[Pi Auth] window.Pi exists:', typeof window.Pi !== 'undefined');
    console.log('[Pi Auth] Requested scopes:', ['username', 'payments']);
    console.log(`[Pi Auth] Timeout value: ${effectiveTimeout}ms`);

    const timer = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      console.error(`[Pi Auth] Authentication timed out after ${elapsed}ms`);
      const sdkReady = typeof window !== 'undefined' && !!window.__TEC_PI_READY;
      const inPiBrowser = isPiBrowser();

      let message: string;
      if (!inPiBrowser) {
        message = ERRORS.NOT_PI_BROWSER;
      } else if (!sdkReady) {
        message = ERRORS.SDK_INIT_FAILED;
      } else {
        message = ERRORS.AUTH_TIMEOUT;
      }
      reject(new Error(message));
    }, effectiveTimeout);

    console.log('[Pi Auth] Calling window.Pi.authenticate()...');
    window.Pi.authenticate(['username', 'payments'], handleIncompletePayment)
      .then((result) => {
        clearTimeout(timer);
        const elapsed = Date.now() - startTime;
        console.log(`[Pi Auth] Authentication successful after ${elapsed}ms:`, {
          uid: result.user.uid,
          username: result.user.username,
        });
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        const elapsed = Date.now() - startTime;
        console.error(`[Pi Auth] Authentication failed after ${elapsed}ms:`, err);
        reject(err);
      });
  });
};

/* =========================================================
   Login with Pi
========================================================= */

export const loginWithPi = async (): Promise<TecAuthResponse> => {
  if (!isPiBrowser()) {
    console.error('[Pi Auth] Not in Pi Browser - window.Pi is undefined');
    throw new Error(ERRORS.NOT_PI_BROWSER);
  }

  console.log('[Pi Auth] isPiBrowser() check passed, proceeding with authentication');
  const piAuth = await authenticateWithTimeout();

  const gatewayRes = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/auth/pi-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken: piAuth.accessToken }),
  });

  if (!gatewayRes.ok) {
    const errBody = await gatewayRes.json().catch(() => ({ message: 'Auth failed' }));
    const errMsg = errBody?.error?.message || errBody?.message || 'Pi verification failed';
    throw new Error(errMsg);
  }

  const raw = await gatewayRes.json();
  const envelope = raw.data ?? raw;
  const data: TecAuthResponse = {
    success: raw.success ?? true,
    isNewUser: envelope.isNewUser ?? false,
    user: {
      id: envelope.user?.id ?? '',
      piId: envelope.user?.piUid ?? envelope.user?.pi_uid ?? '',
      piUsername: envelope.user?.piUsername ?? envelope.user?.pi_username ?? '',
      role: envelope.user?.role ?? 'user',
      subscriptionPlan: envelope.user?.subscriptionPlan ?? null,
      createdAt: envelope.user?.created_at ?? envelope.user?.createdAt ?? '',
    },
    tokens: {
      accessToken: envelope.tokens?.accessToken ?? '',
      refreshToken: envelope.tokens?.refreshToken ?? '',
    },
  };

  try {
    localStorage.setItem('tec_access_token', data.tokens.accessToken);
    localStorage.setItem('tec_refresh_token', data.tokens.refreshToken);
    localStorage.setItem('tec_user', JSON.stringify(data.user));
  } catch (err) {
    console.error('[Pi Auth] Failed to save to localStorage:', err);
    throw new Error(ERRORS.SAVE_FAILED);
  }

  return data;
};
