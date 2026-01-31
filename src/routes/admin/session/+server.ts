import type { RequestHandler } from "@sveltejs/kit";
import { error, json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { token } = await request.json();
    if (!token) {
        return json({ error: 'Token required' }, { status: 400 });
    }

    cookies.set('admin_token', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false, //TODO: set true in prod (https)
        maxAge: 60 * 60
    });
    return json({ success: true });
}