import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, amount, currency = 'PI', payment_method = 'pi', metadata } = body;

    console.log('[Payment Create] Request body:', JSON.stringify({ userId, amount, currency, payment_method }));

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount' },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
      'https://api-gateway-production-6a68.up.railway.app';

    console.log('[Payment Create] Sending to backend:', `${backendUrl}/api/payments/create`);
    console.log('[Payment Create] Auth header present:', !!authHeader);

    const response = await fetch(`${backendUrl}/api/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ userId, amount, currency, payment_method, metadata }),
    });

    console.log('[Payment Create] Backend status:', response.status);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('[Payment Create] Backend error:', JSON.stringify(errData));
      return NextResponse.json(
        { error: errData?.error?.message || `Backend error ${response.status}`, details: errData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Payment Create] Success:', JSON.stringify(data));
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('[Payment Create Route] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
