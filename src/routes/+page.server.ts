import type { PageServerLoad } from "./$types";
import { backendFetch } from "$lib/api/backend";

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        const [profileRes, experiencesRes, educationsRes, projectsRes, resumeRes] = await Promise.all([
            backendFetch(fetch, "/profile").catch(() => null),
            backendFetch(fetch, "/experiences").catch(() => null),
            backendFetch(fetch, "/educations").catch(() => null),
            backendFetch(fetch, "/projects").catch(() => null),
            backendFetch(fetch, "/resume").catch(() => null)
        ]);

        const profile = profileRes?.ok ? await profileRes.json() : null;
        const experiences = experiencesRes?.ok ? await experiencesRes.json() : [];
        const educations = educationsRes?.ok ? await educationsRes.json() : [];
        const projects = projectsRes?.ok ? await projectsRes.json() : [];
        const resume = resumeRes?.ok ? await resumeRes.json() : null;

        return {
            profile,
            experiences,
            educations,
            projects,
            resume
        };
    } catch (error) {
        console.error('Error loading page data:', error);
        return {
            profile: null,
            experiences: [],
            educations: [],
            projects: [],
            resume: null
        };
    }
};
