import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete('admin_token', { path: '/' });
  return new Response(null, { status: 204 });
};