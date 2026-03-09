import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Now expecting amount from the frontend
    const { paymentId, amount } = body;

    if (!paymentId || !amount) {
      return NextResponse.json({ error: 'Missing paymentId or amount' }, { status: 400 });
    }

    // TODO: Replace with actual session user ID in Phase 9
    const mockUserId = 'user_temp_12345';

    // Call the core backend API Gateway
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const response = await fetch(`${backendUrl}/api/v1/payments/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Backend now requires paymentId, amount, and userId
      body: JSON.stringify({
        paymentId,
        amount,
        userId: mockUserId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Approve Payment Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
