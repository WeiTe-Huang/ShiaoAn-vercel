/**
 * Vercel / Netlify 等平台的 OpenAI 代理（金鑰僅在伺服器端）。
 * 路徑：/api/openai/v1/...
 */
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.VITE_OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return Response.json(
      { error: { message: 'OPENAI_API_KEY is not configured on the server.' } },
      { status: 500 }
    );
  }

  const incoming = new URL(request.url);
  const apiPath = incoming.pathname.replace(/^\/api\/openai\/?/, '');
  const target = `https://api.openai.com/${apiPath}${incoming.search}`;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  headers.set('Authorization', `Bearer ${apiKey.trim()}`);

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
  });

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('content-encoding');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
