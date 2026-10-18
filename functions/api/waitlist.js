// Waitlist signup: validate, store in the shared D1 table, then notify by email if the binding exists.
const PRODUCTS = new Set(['margochart', 'margodraw', 'margodesk']);
const EMAIL_RE = /^[^\s@<>()",;:]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const reply = (status, message) =>
  new Response(JSON.stringify({ message }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

async function notify(env, email, product) {
  if (!env.NOTIFY) return;
  const r = await env.NOTIFY.fetch('https://notify.internal/', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, product }),
  });
  if (!r.ok) throw new Error(`notify ${r.status}`);
}

export async function onRequestPost({ request, env, waitUntil }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return reply(400, 'Please enter a valid email address.');
  }
  // Honeypot: real visitors never fill this field. Answer as if it worked.
  if ((form.get('website') || '').toString().trim()) return reply(200, 'Thanks. You are on the list.');
  const email = (form.get('email') || '').toString().trim().toLowerCase();
  const product = (env.PRODUCT || form.get('product') || '').toString();
  if (!PRODUCTS.has(product)) return reply(400, 'Unknown product.');
  if (email.length > 254 || !EMAIL_RE.test(email)) return reply(400, 'Please enter a valid email address.');
  const res = await env.DB.prepare('INSERT OR IGNORE INTO waitlist (email, product) VALUES (?, ?)').bind(email, product).run();
  if (res.meta.changes > 0) waitUntil(notify(env, email, product).catch(e => console.log('notify failed', String(e))));
  return reply(200, 'Thanks. You are on the list.');
}

export const onRequest = () => reply(405, 'Use the form to join.');
