# MargoDesk landing page

Coming-soon page for https://margodesk.com/ with a waitlist form. Static HTML in `public/`, Cloudflare Pages Functions in `functions/`.

- `POST /api/waitlist` stores an email in the shared `margo-waitlist` D1 database. A notification email via the `margo-waitlist-notify` Worker is optional and off until set up.
- `GET /api/export` returns all signups as CSV. It needs `Authorization: Bearer <EXPORT_TOKEN>`; the token is a Pages secret, never committed.

Table schema: `schema.sql`.
