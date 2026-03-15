import { NextRequest, NextResponse } from 'next/server';
import { TEC_SYSTEM_PROMPT } from '@/lib/ai/tec-ai-system-prompt';

export const runtime = 'edge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userContext } = await req.json() as {
      messages: Message[];
      userContext?: {
        username?: string;
        balance?: number;
        locale?: string;
      };
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages array is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    // Build system prompt with user context
    const systemPrompt = `${TEC_SYSTEM_PROMPT}

## CURRENT USER CONTEXT
${userContext?.username ? `- Username: @${userContext.username}` : '- User: Guest'}
${userContext?.balance !== undefined ? `- TEC Balance: ${userContext.balance.toFixed(2)} TEC` : ''}
${userContext?.locale ? `- Language preference: ${userContext.locale === 'ar' ? 'Arabic' : 'English'}` : ''}
`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      return NextResponse.json(
        { error: 'AI service error' },
        { status: 502 }
      );
    }

    // Stream the response back to the client
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('AI chat route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
