// Private CSV export of every signup. Needs Authorization: Bearer <EXPORT_TOKEN> (a Pages secret).
async function same(a, b) {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([a, b].map(v => crypto.subtle.digest('SHA-256', enc.encode(v))));
  return crypto.subtle.timingSafeEqual(x, y);
}
const cell = v => `"${String(v).replace(/"/g, '""')}"`;

export async function onRequestGet({ request, env }) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!env.EXPORT_TOKEN || !token || !(await same(token, env.EXPORT_TOKEN))) return new Response('Not found', { status: 404 });
  const { results } = await env.DB.prepare('SELECT id, email, product, created_at FROM waitlist ORDER BY id').all();
  const csv = ['id,email,product,created_at', ...results.map(r => [r.id, r.email, r.product, r.created_at].map(cell).join(','))].join('\r\n');
  return new Response(csv + '\r\n', {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="margo-waitlist.csv"', 'cache-control': 'no-store' },
  });
}
