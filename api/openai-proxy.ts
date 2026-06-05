/**
 * OpenAI 代理（Vercel）。
 * 由 vercel.json 將 /api/openai/* 轉發至此，path 查詢參數為後續路徑（如 v1/chat/completions）。
 */
export const config = {
  runtime: 'edge',
  maxDuration: 60,
};

function resolveApiPath(request: Request): string {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get('path');
  if (fromQuery) {
    return fromQuery.replace(/^\/+/, '');
  }
  // 本機 Vite / 直接命中時從 pathname 解析
  return url.pathname.replace(/^\/api\/openai\/?/, '').replace(/^\/api\/openai-proxy\/?/, '');
}

export default async function handler(request: Request): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY ?? process.env.VITE_OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return Response.json(
      { error: { message: 'OPENAI_API_KEY is not configured on the server.' } },
      { status: 500 }
    );
  }

  const apiPath = resolveApiPath(request);
  if (!apiPath) {
    return Response.json(
      { error: { message: 'Missing OpenAI API path.' } },
      { status: 400 }
    );
  }

  const incoming = new URL(request.url);
  const forwardQuery = new URLSearchParams(incoming.searchParams);
  forwardQuery.delete('path');
  const qs = forwardQuery.toString();
  const target = `https://api.openai.com/${apiPath}${qs ? `?${qs}` : ''}`;

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
