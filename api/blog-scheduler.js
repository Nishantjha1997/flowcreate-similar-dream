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
  const cronAuthorization = req.headers.authorization || '';
  const expectedAuthorization = schedulerSecret ? `Bearer ${schedulerSecret}` : '';

  // Vercel sends CRON_SECRET as a bearer token for cron invocations. Requiring
  // the same secret here also keeps the dispatcher from becoming a public
  // trigger when someone discovers the endpoint.
  if (!schedulerSecret || cronAuthorization !== expectedAuthorization) {
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
        'x-blog-scheduler-secret': schedulerSecret,
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
