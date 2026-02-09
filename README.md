# Portfolio Frontend | Svelte

This is SvelteKit frontend for my portfolio website. Connects to the backend API for showing profile, projects, work experience, and all that stuff. This repo has been developed and used for my portfolio project (visit: https://alvayonara.com/).

## What's Inside?

**Frontend:** SvelteKit 2.x, TypeScript, Svelte 5

**Styling:** Custom CSS with Bootstrap, jQuery plugins for animations

**File Storage:** Amazon S3 (for images)

**Hosting:** Vercel

**Features:** Admin panel for managing content, public pages for visitors, contact form

## Project Structure

Built with SvelteKit routing:

```
portfolio-frontend/
├── src/
│   ├── lib/
│   │   ├── api/           # API client for backend
│   │   └── env.ts         # Environment config
│   └── routes/
│       ├── +page.svelte   # Main homepage (public)
│       └── admin/
│           ├── login/     # Admin login page
│           ├── logout/    # Logout handler
│           ├── session/   # Session check
│           └── (protected)/
│               ├── profile/      # Manage profile info
│               ├── projects/     # Manage projects
│               ├── experiences/  # Manage work experience
│               ├── educations/   # Manage education
│               ├── skills/       # Manage skills
│               └── resume/       # Upload resume PDF
├── static/               # Static assets (CSS, JS, images)
└── build/               # Production build output
```

**lib/api** - Backend API calls. Handles all communication with the backend service.

**routes/** - Main public page showing portfolio, projects, work history, skills, and contact form.

**routes/admin** - Admin panel stuff. Need to login first to access protected pages.

**static/** - CSS, JavaScript libraries, fonts, and images that don't change.

## Main Features

Clean portfolio homepage with smooth animations. Admin panel for managing all content without touching code. Project popups using Magnific Popup library. Contact form with honeypot spam protection. Responsive design that works on mobile. All images loaded from S3 for faster performance.

## Deployment on Vercel

Already configured for Vercel. Connect your repo and set the environment variables. The rest should be straightforward.

## What's Next?

Planning to add more improvements:

- Add proper TypeScript types for all API responses
- Unit tests for components and API client
- E2E tests using Playwright
- Better error handling and loading states
- PWA support for offline access
- Performance optimization for images

## License

MIT License - use this as reference for building your own portfolio website.
