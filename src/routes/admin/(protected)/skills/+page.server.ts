import type { PageServerLoad, Actions } from "./$types";
import { backendFetch } from "$lib/api/backend";
import { redirect, fail } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    const token = cookies.get("admin_token");
    if (!token) {
        throw redirect(302, "/admin/login");
    }
    const groupRes = await backendFetch(fetch, "/admin/skill-groups", token);
    if (!groupRes.ok) {
        throw new Error("Failed to load groups");
    }
    const groups = await groupRes.json();

    const skillsPromises = groups.map(async (group: any) => {
        const res = await backendFetch(fetch, `/admin/skills/group/${group.id}`, token);
        if (res.ok) {
            return res.json();
        }
        return [];
    });

    const skillsArrays = await Promise.all(skillsPromises);
    const skills = skillsArrays.flat();

    return {
        groups,
        skills
    };
};

export const actions: Actions = {
    createGroup: async ({ request, fetch, cookies }) => {
        const token = cookies.get("admin_token");
        if (!token) {
            return fail(401);
        }
        const data = Object.fromEntries(await request.formData());
        const res = await backendFetch(fetch, "/admin/skill-groups", token, {
            method: "POST",
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            return fail(400);
        }
        return { success: true };
    },

    deleteGroup: async ({ request, fetch, cookies }) => {
        const token = cookies.get("admin_token");
        const id = (await request.formData()).get("id");

        const res = await backendFetch(fetch, `/admin/skill-groups/${id}`, token, {
            method: "DELETE"
        });
        if (!res.ok) {
            return fail(400);
        }
        return { success: true };
    },

    createSkill: async ({ request, fetch, cookies }) => {
        const token = cookies.get("admin_token");
        if (!token) {
            return fail(401);
        }
        const data = Object.fromEntries(await request.formData());
        const res = await backendFetch(fetch, "/admin/skills", token, {
            method: "POST",
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            return fail(400);
        }
        return { success: true };
    },

    updateSkill: async ({ request, fetch, cookies }) => {
        const token = cookies.get("admin_token");
        if (!token) {
            return fail(401);
        }
        const formData = await request.formData();
        const id = formData.get("id");
        const data = {
            name: formData.get("name"),
            skillGroupId: Number(formData.get("skillGroupId"))
        };
        
        const res = await backendFetch(fetch, `/admin/skills/${id}`, token, {
            method: "PUT",
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.text();
            console.error("Update skill error:", error);
            return fail(400, { error });
        }
        return { success: true };
    },

    deleteSkill: async ({ request, fetch, cookies }) => {
        const token = cookies.get("admin_token");
        const id = (await request.formData()).get("id");

        const res = await backendFetch(fetch, `/admin/skills/${id}`, token, {
            method: "DELETE"
        });
        if (!res.ok) {
            return fail(400);
        }
        return { success: true };
    }
};