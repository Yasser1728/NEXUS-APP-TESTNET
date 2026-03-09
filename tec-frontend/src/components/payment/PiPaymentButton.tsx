"use client";

import { useState, useCallback } from "react";

export default function PiPaymentButton() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  // 1. جلب الرصيد
  const fetchBalance = async (userId: string) => {
    try {
      const res = await fetch(`/api/wallet/balance?userId=${userId}`);
      const data = await res.json();
      if (data && data.balance !== undefined) {
        setBalance(data.balance);
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  // 2. زرار Connect Pi Wallet
  const handleAuth = async () => {
    try {
      setLoading(true);
      setStatusMsg('');
      const scopes = ['payments', 'username'];
      
      // @ts-ignore
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      
      if (authResult?.user?.uid) {
        const res = await fetch('/api/auth/pi-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authResult }),
        });
        
        const data = await res.json();
        if (data.token) {
          setUser(data.user);
          fetchBalance(data.user.piUid);
          setStatusMsg('Authenticated successfully!');
        }
      }
    } catch (error) {
      console.error("Auth Error:", error);
      setStatusMsg('Failed to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  // 3. زرار الدفع
  const handlePayment = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setStatusMsg('Initiating payment...');
      // @ts-ignore
      await window.Pi.createPayment({
        amount: 1,
        memo: "Purchase 0.1 TEC",
        metadata: { userId: user.piUid },
      }, {
        onReadyForServerApproval: (paymentId: string) => {
          fetch('/api/payment/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, amount: 1, userId: user.piUid })
          });
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          fetch('/api/payment/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, txid })
          }).then(() => {
            setStatusMsg("Payment successful! Balance updated.");
            setTimeout(() => fetchBalance(user.piUid), 2000);
          });
        },
        onCancel: () => setStatusMsg("Payment cancelled."),
        onError: () => setStatusMsg("Payment error occurred."),
      });
    } catch (error) {
      setStatusMsg("Payment failed.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const onIncompletePaymentFound = (payment: any) => {
    console.warn("Incomplete payment found", payment);
  };

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center text-black">
        <h1 className="text-3xl font-bold text-purple-600 mb-4">TEC-APP</h1>

        {!user ? (
          <>
            {/* الشاشة الأولى: قبل تسجيل الدخول */}
            <p className="text-gray-600 mb-8 font-semibold">
              Welcome to Pi Network Integration
            </p>
            <button
              onClick={handleAuth}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold py-3 px-4 rounded-lg w-full transition-colors text-lg shadow-md"
            >
              {loading ? 'Connecting...' : 'Connect Pi Wallet'}
            </button>
            {statusMsg && <p className="text-red-500 mt-4 text-sm">{statusMsg}</p>}
          </>
        ) : (
          <>
            {/* الشاشة الثانية: بعد تسجيل الدخول */}
            <p className="text-green-600 font-bold mb-4 text-xl">
              Welcome, @{user.username}!
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-left border border-gray-200 shadow-inner">
              <p className="mb-2"><strong className="text-purple-600">UID:</strong> <span className="text-gray-600 text-xs">{user.piUid}</span></p>
              <p><strong className="text-purple-600">TEC Balance:</strong> <span className="font-bold text-lg">{balance !== null ? balance : "..."} TEC</span></p>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-3 px-4 rounded-lg w-full transition-colors text-lg shadow-md"
            >
              {loading ? 'Processing...' : 'Pay 1 Pi = 0.1 TEC'}
            </button>

            {statusMsg && (
              <p className={`mt-4 font-semibold ${statusMsg.includes('successful') ? 'text-green-600' : 'text-gray-600'}`}>
                {statusMsg}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
