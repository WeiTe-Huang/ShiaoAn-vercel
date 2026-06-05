/** Netlify Functions：轉發 /api/openai/* → OpenAI */
export default async (req, context) => {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.VITE_OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return new Response(
      JSON.stringify({ error: { message: 'OPENAI_API_KEY is not configured.' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(req.url);
  const prefix = '/api/openai/';
  const idx = url.pathname.indexOf(prefix);
  const apiPath =
    idx >= 0 ? url.pathname.slice(idx + prefix.length) : context.params?.splat ?? '';
  const target = `https://api.openai.com/${apiPath}${url.search}`;

  const headers = new Headers(req.headers);
  headers.set('Authorization', `Bearer ${apiKey.trim()}`);
  headers.delete('host');

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
  });

  const outHeaders = new Headers(upstream.headers);
  outHeaders.delete('content-encoding');

  return new Response(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
};

export const config = {
  path: '/api/openai/*',
};
