// Anything not served from the production domain (pages.dev previews, local dev) is kept out of search.
const PROD = new Set(['margochart.com', 'margodraw.com', 'margodesk.com']);

export async function onRequest({ request, next }) {
  const host = new URL(request.url).hostname;
  if (PROD.has(host)) return next();
  if (new URL(request.url).pathname === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': 'noindex, nofollow' },
    });
  }
  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return out;
}
