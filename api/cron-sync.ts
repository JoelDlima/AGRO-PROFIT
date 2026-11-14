// Disabled until a new service and its authorization are explicitly designed.
export default async function handler(_req: unknown, res: { status(code: number): { json(body: { error: string }): unknown } }) {
  return res.status(503).json({ error: 'Service unavailable' });
}
