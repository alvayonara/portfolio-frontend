import { redirect } from "@sveltejs/kit";

export async function POST({ cookies }) {
    cookies.delete('access_token', { path: '/'});
    throw redirect(302, '/admin/login');
}