import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Support both 'txid' and 'transaction_id' field names
    const { payment_id, transaction_id, txid } = body;
    const finalTxId = transaction_id ?? txid;

    if (!payment_id) {
      return NextResponse.json(
        { error: 'Missing required field: payment_id' },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
      'https://api-gateway-production-6a68.up.railway.app';

    const idempotencyKey = randomUUID();

    const response = await fetch(`${backendUrl}/api/payments/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({ payment_id, transaction_id: finalTxId }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('[Payment Complete] Backend error:', JSON.stringify(errData));
      return NextResponse.json(
        { error: errData?.error?.message || `Backend error ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('[Payment Complete Route] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
