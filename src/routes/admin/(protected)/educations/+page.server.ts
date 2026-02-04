import type { PageServerLoad, Actions } from "./$types";
import { backendFetch } from "$lib/api/backend";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ fetch, cookies }) => {
  const res = await backendFetch(fetch, "/educations", undefined);
  if (!res.ok) {
    throw new Error("Failed to load educations");
  }
  const educations = await res.json();
  return { educations };
};

export const actions: Actions = {
  create: async ({ request, fetch, cookies }) => {
    const token = cookies.get("admin_token");
    if (!token) {
        return fail(401);
    }
    const data = Object.fromEntries(await request.formData());
    const res = await backendFetch(fetch, "/admin/educations", token, {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      return fail(400, { error: "Failed to create education" });
    }
    return { success: true };
  },

  update: async ({ request, fetch, cookies }) => {
    const token = cookies.get("admin_token");
    if (!token) {
        return fail(401);
    }
    const data = Object.fromEntries(await request.formData());
    const id = data.id;
    delete data.id;

    const res = await backendFetch(fetch, `/admin/educations/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      return fail(400, { error: "Failed to update education" });
    }
    return { success: true };
  },

  delete: async ({ request, fetch, cookies }) => {
    const token = cookies.get("admin_token");
    if (!token) {
        return fail(401);
    }
    const id = (await request.formData()).get("id");
    const res = await backendFetch(fetch, `/admin/educations/${id}`, token, {
      method: "DELETE"
    });
    if (!res.ok) {
      return fail(400, { error: "Failed to delete education" });
    }
    return { success: true };
  }
};