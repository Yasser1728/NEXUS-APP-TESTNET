'use client';

import { useState, useCallback } from 'react';
import { loginWithPi, getAccessToken } from '@/lib-client/pi/pi-auth';
import type { TecUser } from '@/types/pi.types';

export default function PiPaymentButton() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<TecUser | null>(null);
  const [balance, setBalance] = useState<number | string>('...');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setError = (text: string) => setStatusMsg({ text, isError: true });
  const setInfo = (text: string) => setStatusMsg({ text, isError: false });
  const clearStatus = () => setStatusMsg(null);

  const fetchBalance = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/wallet/balance?userId=${userId}`);
      const data = await res.json();
      setBalance(data?.balance ?? 0);
    } catch {
      setBalance(0);
    }
  }, []);

  // ── Step 0: Authenticate with Pi and TEC backend ───────────────────────────

  const handleAuth = async () => {
    try {
      setLoading(true);
      clearStatus();

      const authData = await loginWithPi();

      setUser(authData.user);
      fetchBalance(authData.user.id);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Authentication failed / فشل تسجيل الدخول';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1: Create internal payment record, then open Pi payment dialog ────

  const handlePayment = useCallback(async () => {
    if (!user) return;

    const token = getAccessToken();
    if (!token) {
      setError(
        'Session expired. Please reconnect your wallet. / انتهت الجلسة، يرجى إعادة الاتصال.'
      );
      setUser(null);
      setBalance('...');
      return;
    }

    try {
      setLoading(true);
      setInfo('Processing payment... / جاري معالجة الدفع...');

      // Create an internal payment record first to get a backend UUID
      const createRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          amount: 1,
          currency: 'PI',
          payment_method: 'pi',
          metadata: { piUserId: user.piId },
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err?.error?.message || 'Failed to initiate payment / فشل بدء عملية الدفع');
      }

      const createData = await createRes.json();
      const internalPaymentId: string = createData?.data?.payment?.id ?? createData?.data?.id;

      if (!internalPaymentId) {
        throw new Error('Invalid payment response from server / استجابة غير صالحة من الخادم');
      }

      // Open Pi Network payment dialog
      // @ts-ignore – window.Pi is injected by the Pi Browser SDK
      window.Pi.createPayment(
        {
          amount: 1,
          memo: 'Purchase 0.1 TEC',
          metadata: { internalPaymentId },
        },
        {
          // ── Approval callback (Step 2) ────────────────────────────────────
          onReadyForServerApproval: async (piPaymentId: string) => {
            try {
              const approveRes = await fetch('/api/payment/approve', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  payment_id: internalPaymentId,
                  pi_payment_id: piPaymentId,
                }),
              });

              if (!approveRes.ok) {
                const err = await approveRes.json().catch(() => ({}));
                console.error('[TEC Payment] Approval failed:', err);
              }
            } catch (err) {
              console.error('[TEC Payment] Approval request error:', err);
            }
          },

          // ── Completion callback (Step 3) ──────────────────────────────────
          onReadyForServerCompletion: async (piPaymentId: string, txid: string) => {
            try {
              const completeRes = await fetch('/api/payment/complete', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  payment_id: internalPaymentId,
                  txid,
                }),
              });

              if (completeRes.ok) {
                setInfo('Payment successful! Balance updated. / تمت عملية الدفع بنجاح!');
                setTimeout(() => fetchBalance(user.id), 2000);
              } else {
                const err = await completeRes.json().catch(() => ({}));
                console.error('[TEC Payment] Completion failed:', err);
                setError(
                  'Payment completion failed. Please contact support. / فشل إتمام الدفع، تواصل مع الدعم.'
                );
              }
            } catch (err) {
              console.error('[TEC Payment] Completion request error:', err);
              setError(
                'Network error during payment completion. / خطأ في الشبكة أثناء إتمام الدفع.'
              );
            } finally {
              setLoading(false);
            }
          },

          onCancel: (_piPaymentId: string) => {
            setError('Payment cancelled. / تم إلغاء الدفع.');
            setLoading(false);
          },

          onError: (error: Error) => {
            console.error('[TEC Payment] Pi SDK error:', error);
            setError('Payment error. Please try again. / حدث خطأ، يرجى المحاولة مرة أخرى.');
            setLoading(false);
          },
        }
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Payment failed / فشل الدفع';
      setError(message);
      setLoading(false);
    }
  }, [user, fetchBalance]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {!user ? (
          <>
            {/* Connect Pi Wallet — TEC gold/dark design */}
            <button
              onClick={handleAuth}
              disabled={loading}
              className="
                w-full relative overflow-hidden
                bg-gradient-to-r from-[#1a1208] via-[#2a1f0a] to-[#1a1208]
                hover:from-[#2a1f0a] hover:via-[#3d2e10] hover:to-[#2a1f0a]
                disabled:opacity-50 disabled:cursor-not-allowed
                text-[#d4af37] font-semibold
                py-4 px-6 rounded-2xl
                transition-all duration-300
                shadow-[0_0_20px_rgba(212,175,55,0.15)]
                hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]
                border border-[#d4af37]/30 hover:border-[#d4af37]/60
                text-base tracking-widest uppercase
                group
              "
            >
              {/* Shimmer overlay on hover */}
              <span
                className="
                  absolute inset-0
                  bg-gradient-to-r from-transparent via-[#d4af37]/8 to-transparent
                  translate-x-[-100%] group-hover:translate-x-[100%]
                  transition-transform duration-700
                "
              />

              {/* Button content */}
              <span className="relative flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-[#d4af37]"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl font-serif leading-none">π</span>
                    <span>Connect Pi Wallet</span>
                  </>
                )}
              </span>
            </button>

            {/* Error / info message */}
            {statusMsg && (
              <p
                className={`mt-4 text-sm font-medium leading-relaxed whitespace-pre-line ${
                  statusMsg.isError ? 'text-red-400' : 'text-[#d4af37]'
                }`}
              >
                {statusMsg.text}
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Welcome message */}
            <p className="text-[#d4af37] font-semibold text-lg tracking-wide">
              Welcome, @{user.piUsername}!
            </p>

            {/* User info card */}
            <div className="bg-gray-900/60 p-4 rounded-2xl text-sm text-left border border-[#d4af37]/20 backdrop-blur-sm">
              <p className="text-gray-400 mb-2">
                <span className="text-gray-200 font-medium">User ID: </span>
                <span className="text-xs break-all text-gray-400">{user.id}</span>
              </p>
              <p className="text-gray-400">
                <span className="text-gray-200 font-medium">TEC Balance: </span>
                <span className="font-bold text-lg text-[#d4af37] ml-1">{balance} TEC</span>
              </p>
            </div>

            {/* Pay button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="
                w-full relative overflow-hidden
                bg-gradient-to-r from-[#0a1f0f] via-[#0f2e16] to-[#0a1f0f]
                hover:from-[#0f2e16] hover:via-[#174021] hover:to-[#0f2e16]
                disabled:opacity-50 disabled:cursor-not-allowed
                text-emerald-400 font-semibold
                py-4 px-6 rounded-2xl
                transition-all duration-300
                shadow-[0_0_20px_rgba(52,211,153,0.1)]
                hover:shadow-[0_0_30px_rgba(52,211,153,0.25)]
                border border-emerald-500/30 hover:border-emerald-500/60
                text-base tracking-widest uppercase
                group
              "
            >
              <span
                className="
                  absolute inset-0
                  bg-gradient-to-r from-transparent via-emerald-400/8 to-transparent
                  translate-x-[-100%] group-hover:translate-x-[100%]
                  transition-transform duration-700
                "
              />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Pay 1 π = 0.1 TEC</span>
                )}
              </span>
            </button>

            {/* Status message */}
            {statusMsg && (
              <p
                className={`mt-2 text-sm font-medium leading-relaxed whitespace-pre-line ${
                  statusMsg.isError ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {statusMsg.text}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
