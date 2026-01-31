import { json } from "@sveltejs/kit";

export async function POST({ request, cookies }) {
    const {token} = await request.json();

    cookies.set('access_token', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false // TODO: change in prod due https
    });
    return json({success: true});
}