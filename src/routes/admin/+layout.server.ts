import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies, url }) => {
  const token = cookies.get('access_token');
  if (!token && url.pathname !== '/admin/login') {
    throw redirect(302, '/admin/login');
  }
  return {};
};