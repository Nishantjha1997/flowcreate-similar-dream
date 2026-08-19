const PROJECT_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';

function json(res, body, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return json(res, { error: 'Method not allowed' }, 405);
  }

  const schedulerSecret = process.env.BLOG_SCHEDULER_SECRET || process.env.CRON_SECRET;
  const cronSecret = process.env.CRON_SECRET;
  const backendSecret = process.env.BLOG_SCHEDULER_SECRET || cronSecret;
  const cronAuthorization = req.headers.authorization || '';
  const acceptedAuthorizations = [schedulerSecret, cronSecret]
    .filter(Boolean)
    .map((secret) => `Bearer ${secret}`);

  // Vercel sends CRON_SECRET as a bearer token for cron invocations. Accepting
  // either configured secret keeps the dispatcher private while allowing the
  // backend worker secret to remain independent from Vercel's cron secret.
  if (!acceptedAuthorizations.includes(cronAuthorization)) {
    return json(res, { error: 'Unauthorized' }, 401);
  }
  if (!PROJECT_URL) {
    return json(res, { error: 'Scheduler backend is not configured' }, 503);
  }

  try {
    const response = await fetch(`${PROJECT_URL.replace(/\/$/, '')}/functions/v1/blog-scheduler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-blog-scheduler-secret': backendSecret,
      },
      body: JSON.stringify({ action: 'tick' }),
    });
    const text = await response.text();
    let body;
    try { body = JSON.parse(text); } catch { body = { error: text.slice(0, 500) }; }
    return json(res, body, response.status);
  } catch (error) {
    return json(res, { error: error instanceof Error ? error.message : 'Scheduler request failed' }, 502);
  }
}
