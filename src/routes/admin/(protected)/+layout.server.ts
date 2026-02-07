import { redirect } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib/env';

export const load = async ({ cookies }) => {
  const token = cookies.get('admin_token');
  if (!token) {
    throw redirect(302, '/admin/login');
  }
  const res = await fetch(`${API_BASE_URL}/admin/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (res.status === 401 || res.status === 403) {
    cookies.delete('admin_token', {path: '/'});
    throw redirect(302, '/admin/login');
  }

  return {};
};