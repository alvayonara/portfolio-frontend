import { redirect } from "@sveltejs/kit";

export const load = async ({cookies}) => {
    const token = cookies.get('admin_token');
    if (token) {
        throw redirect(302, '/admin/profile');
    }
}