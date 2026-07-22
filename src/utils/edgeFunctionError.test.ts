import { describe, expect, it } from 'vitest';

import { getEdgeFunctionErrorMessage } from './edgeFunctionError';

describe('getEdgeFunctionErrorMessage', () => {
  it('reads the actionable error from a JSON response', async () => {
    const error = {
      context: new Response(JSON.stringify({ error: 'Monthly AI limit reached' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }),
      message: 'Edge Function returned a non-2xx status code',
    };

    await expect(getEdgeFunctionErrorMessage(error, 'Fallback')).resolves.toBe('Monthly AI limit reached');
  });

  it('accepts a JSON message when an error field is absent', async () => {
    const error = {
      context: new Response(JSON.stringify({ message: 'Payment already processed' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      }),
    };

    await expect(getEdgeFunctionErrorMessage(error, 'Fallback')).resolves.toBe('Payment already processed');
  });

  it('reads a plain-text response body', async () => {
    const error = {
      context: new Response('Provider temporarily unavailable', { status: 503 }),
    };

    await expect(getEdgeFunctionErrorMessage(error, 'Fallback')).resolves.toBe('Provider temporarily unavailable');
  });

  it('uses the safe fallback instead of the SDK generic non-2xx message', async () => {
    const error = new Error('Edge Function returned a non-2xx status code');

    await expect(getEdgeFunctionErrorMessage(error, 'Please retry')).resolves.toBe('Please retry');
  });

  it('preserves an actionable ordinary error message', async () => {
    const error = new Error('Network connection lost');

    await expect(getEdgeFunctionErrorMessage(error, 'Fallback')).resolves.toBe('Network connection lost');
  });
});
