import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const ALLOWED_MODELS = ['claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5'];
const DEFAULT_MODEL = 'claude-opus-4-8';
const MAX_TOKENS_CAP = 2048;

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI comparison is not configured.' }, { status: 503 });
  }

  const body = await request.json();
  const { messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages is required' }, { status: 400 });
  }

  const model = ALLOWED_MODELS.includes(body.model) ? body.model : DEFAULT_MODEL;
  const maxTokens = Math.min(Math.max(Number(body.max_tokens) || 1000, 1), MAX_TOKENS_CAP);

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      messages,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Anthropic compare error:', error);
    const status = error?.status || 500;
    return NextResponse.json({ error: 'Comparison request failed. Please try again.' }, { status });
  }
}
