<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — MentorLagbe CLIENT (Next.js)

> You are the coding agent for the **client** repo of MentorLagbe.
> This file is the single source of truth. Read it fully before every task.
> The server repo has its own `AGENTS.md`. The API contract (section 9) must match it exactly.

---

## 0. Agent Operating Rules (MOST IMPORTANT)

1. **Read this file first, every session.** Then read the "Progress Log" (section 17).
2. **After finishing any task, update section 17 (Progress Log)**: tick the checkbox, add a dated line under "Change Log", and record any decision under "Decisions". Never skip this.
3. **Working site beats pretty site.** Deployment failure = score 0. Never leave `main` broken.
4. **Never commit secrets.** `.env.local` is git-ignored. Only commit `.env.example` with empty values.
5. **Small, meaningful commits.** Minimum 20 commits on this repo. Use Conventional Commits:
   `feat: add tuition card component`, `fix: stop redirect on reload in private routes`, `style: align hero section`, `chore: add sonner toaster`. Suggest a commit message after every completed unit of work. Never one giant commit.
6. **Do not invent API endpoints.** Only use endpoints in section 9. If one is missing, add it to section 9 and note it in the Change Log so the server agent can build it.
7. **Do not add features outside this file** without asking. Do not swap the tech stack.
8. **Ask before deviating.** If a requirement is ambiguous, pick the simplest option, log it under "Decisions", and continue.
9. Prefer clarity and speed over perfection. No over-engineering, no unused abstractions.
10. TypeScript strict. No `any` unless unavoidable (comment why).

---

## 1. Project Summary

**MentorLagbe** — Smart Tuition & Mentorship Platform (EdTech). Role-based full-stack app.

| Role    | Can do                                                                                                        |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| Student | Browse/search tuitions, apply (once per tuition), track and cancel pending applications, upgrade to Pro ($10) |
| Tutor   | Post tuitions (Free: max 2, Pro: unlimited), edit/delete/toggle, manage applicants, upgrade to Pro ($15)      |
| Admin   | Approve/reject tuitions, manage user roles, view all payments and platform stats                              |

Stack: Next.js (App Router, TypeScript), Tailwind CSS, shadcn/ui, BetterAuth (client), JWT, Stripe Checkout, ImgBB.
Backend is a separate Express + MongoDB repo deployed on Vercel.

---

## 2. Tech Stack and Packages

Framework: `next` (App Router), `react`, `typescript`, `tailwindcss`
UI: `shadcn/ui` (chosen UI library; do not mix with HeroUI/DaisyUI), `lucide-react`, `framer-motion`
Forms: `react-hook-form`, `zod`, `@hookform/resolvers`
Auth: `better-auth` (client only here)
HTTP: `axios`
Toast: `sonner`
Theme: `next-themes`
Icons: `react-icons` (use `FaXTwitter` / `RiTwitterXFill` for the **X logo** in footer. NEVER the old bird)
Stripe: redirect to the Checkout URL returned by the server; `@stripe/stripe-js` optional.

Every package used must be listed in README.md.

---

## 3. Environment Variables (`.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_IMGBB_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- Also create `.env.example` with the same keys, empty values.
- Never hardcode URLs or keys. Always read from `process.env`.
- On Vercel, set the same variables with production values.

---

## 4. Design System (follow strictly)

**Theme: Indigo + Amber. Trustworthy, energetic, clean. NOT a template look.**

| Token                  | Light     | Dark      |
| ---------------------- | --------- | --------- |
| Primary                | `#4F46E5` | `#6366F1` |
| Primary dark (hover)   | `#3730A3` | `#4F46E5` |
| Accent / CTA highlight | `#F59E0B` | `#FBBF24` |
| Background             | `#F8FAFC` | `#0B1120` |
| Card                   | `#FFFFFF` | `#111827` |
| Border                 | `#E2E8F0` | `#1F2937` |
| Text                   | `#0F172A` | `#F1F5F9` |
| Muted text             | `#64748B` | `#94A3B8` |
| Success                | `#10B981` | `#10B981` |
| Warning                | `#F59E0B` | `#F59E0B` |
| Danger                 | `#EF4444` | `#EF4444` |

Define these as CSS variables in `globals.css` and map them in Tailwind/shadcn theme. Do not scatter raw hex values in components.

**Fonts** (via `next/font/google`): Headings **Plus Jakarta Sans**, body **Inter**.

**Consistency rules (graders check these):**

- All section headings share ONE style: `text-3xl md:text-4xl font-bold` + same color. Build a reusable `<SectionHeading title subtitle />`.
- ONE button style across the site (`rounded-lg`, same padding/height). Primary = indigo, secondary = outline, highlight CTA = amber. Use the shadcn `Button` variants only.
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`. Section spacing: `py-16 md:py-20`.
- **Cards must be equal height and width.** Grid + `h-full flex flex-col`, push the button down with `mt-auto`. Images: `aspect-video object-cover w-full`. Clamp titles: `line-clamp-2`.
- Navbar logo/brand "MentorLagbe" has the **same style and size** as on the home page.
- Fully responsive: mobile (375), tablet (768), desktop (1280+). Test all three.
- Good contrast, proper alignment, balanced spacing. No cramped or random layout ("gobindo design" gets marks cut).
- Image sources: Unsplash, Pexels, unDraw. Use `next/image` with allowed hosts configured in `next.config.ts` (`images.unsplash.com`, `i.ibb.co`, `images.pexels.com`, plus any avatar host).
- Dark/Light toggle (optional feature) must cover landing pages AND dashboard.

---

## 5. Folder Structure

```
mentorlagbe-client/
├── .env.local  (git-ignored)
├── .env.example
├── .gitignore
├── AGENTS.md
├── README.md
├── next.config.ts
├── package.json
├── public/images/
└── src/
    ├── app/
    │   ├── layout.tsx            # fonts, providers, Navbar, Footer, Toaster
    │   ├── page.tsx              # Home
    │   ├── globals.css
    │   ├── not-found.tsx         # custom 404 + Back to Home
    │   ├── error.tsx             # error boundary + Back to Home ("use client")
    │   ├── loading.tsx
    │   ├── (public)/
    │   │   ├── tuitions/page.tsx
    │   │   ├── tuitions/[id]/page.tsx
    │   │   ├── pricing/page.tsx
    │   │   ├── how-it-works/page.tsx
    │   │   ├── sign-in/page.tsx
    │   │   ├── sign-up/page.tsx
    │   │   └── payment/{success,cancel}/page.tsx
    │   └── dashboard/
    │       ├── layout.tsx        # collapsible sidebar + topbar + auth guard
    │       ├── loading.tsx
    │       ├── page.tsx          # redirects by role
    │       ├── profile/page.tsx
    │       ├── student/{page.tsx, my-applications/page.tsx, saved/page.tsx}
    │       ├── tutor/{page.tsx, post-tuition/page.tsx, my-tuitions/page.tsx, applicants/page.tsx}
    │       └── admin/{page.tsx, users/page.tsx, tuitions/page.tsx, transactions/page.tsx}
    ├── components/
    │   ├── ui/                   # shadcn
    │   ├── layout/               # Navbar, Footer, Sidebar, Topbar, ThemeToggle
    │   ├── home/                 # Hero, FeaturedTuitions, PricingSection, HowItWorks, SubjectsStats, Testimonials
    │   ├── tuition/              # TuitionCard, TuitionFilters, ApplyForm, Pagination
    │   ├── dashboard/            # StatCard, DataTable, StatusBadge, RoleGuard
    │   └── shared/               # SectionHeading, ImageUpload, Spinner, Skeletons
    ├── lib/
    │   ├── auth-client.ts        # BetterAuth client
    │   ├── api.ts                # axios instance + JWT interceptor
    │   ├── imgbb.ts              # upload helper
    │   └── utils.ts
    ├── hooks/                    # useRole, useApiToken
    ├── providers/                # ThemeProvider, AuthProvider (if needed)
    └── types/index.ts
```

**Do NOT create `middleware.ts` for auth.** The session cookie is set by the server domain, so Next.js middleware on the client domain cannot read it. Protect routes client-side (section 7).

---

## 6. Pages and Requirements

### Public

- **`/` Home**: (1) Hero with headline "Find Your Ideal Tutor or Mentorship Batch Today", search/CTA to `/tuitions`, quality image. (2) **Featured Tuitions**: 6 latest approved+active from the API, equal-size cards showing Title, Subject, Class Level, Mode, Monthly Fee, Tutor Name, "View Details". (3) Pricing section Free vs Pro for Tutors and Students with "Subscribe with Stripe" CTA. (4) How It Works (3–4 steps, both student and tutor flow). (5) Top Subjects (Math, Physics, Programming, IELTS...) + counters + testimonials. Add tasteful framer-motion animations.
- **`/tuitions`**: grid of approved+active tuitions. Search (title/subject) + filters (Subject, Class Level, Mode). **All search/filter/pagination is SERVER-SIDE** via query params. Debounce search (400ms). Keep state in the URL. Pagination: Previous / Next / page numbers.
- **`/tuitions/[id]`**: banner, title, subject, class level, schedule/days per week, location/mode, monthly fee, description, tutor summary. Apply form (Phone, Preferred Schedule, Learning Note). **Only `student` can apply.** Tutor/Admin: button disabled/hidden + notice. Guest: prompt to sign in. If already applied: show "Already Applied". Bookmark button for students (optional feature).
- **`/pricing`**: Free vs Pro tiers (Tutor $15, Student $10). Subscribe button calls the checkout endpoint and redirects to Stripe. Guests are sent to sign in first. Already-pro users see "Current Plan".
- **`/sign-up`**: Full Name, Email, Password, Role (Student | Tutor only, never Admin). Validate: required, email format, password min 6. Default plan free (server sets it). Optional: Google login.
- **`/sign-in`**: Email + Password, validation, error toasts.
- **`/payment/success`**: reads `session_id` from the URL, calls verify endpoint, shows result, refreshes user data. Must be idempotent (reload safe).
- **`/payment/cancel`**: friendly message + link back to pricing.
- **`/how-it-works`**: static explainer page.

### Navbar

- Guest: Logo "MentorLagbe", Home, Browse Tuitions, Pricing, How It Works, **Sign In**, **Sign Up**.
- Authenticated: Avatar, Name, **Role badge** (Student/Tutor/Admin), **Dashboard**, **Update Profile**, **Sign Out** (toast on logout). Mobile hamburger menu.

### Footer

Logo, tagline, quick links, contact (email/phone/location), copyright, social icons including the **X logo** (not the bird).

### Dashboard (shared layout)

Responsive, full-width, collapsible sidebar toggle, topbar, user profile summary, role-based menu. Sidebar items depend on role.

**Student**

- `/dashboard/student`: stat cards: Total Applied, Accepted, Pending, Current Plan.
- `/dashboard/student/my-applications`: table/cards: Tuition Title, Tutor Name & Email, Monthly Fee, Applied Date, Status badge. **Cancel** only when `pending`.
- `/dashboard/student/saved` (optional): saved tuitions.

**Tutor**

- `/dashboard/tutor`: Total Posted, Active/Approved, Total Applicants, Current Plan.
- `/dashboard/tutor/post-tuition`: validated form (Title, Subject, Class Level, Mode, Location, Monthly Fee, Days/Week, Description, **banner via ImgBB file upload**). Free plan with 2 posts: show upgrade prompt and disable submit. Server enforces the real limit.
- `/dashboard/tutor/my-tuitions`: full CRUD. Show approvalStatus badge and active status. Edit (modal or page), Delete (confirm dialog), Toggle Active/Closed.
- `/dashboard/tutor/applicants`: Student Name, Email, Phone, Preferred Schedule, Note, Tuition Title. Accept / Reject buttons.

**Admin**

- `/dashboard/admin`: Total Users, Total Tutors, Pending vs Approved tuitions, Total Revenue.
- `/dashboard/admin/users`: list users, change role (student/tutor/admin). Cannot demote yourself.
- `/dashboard/admin/tuitions`: all tuitions, Approve / Reject.
- `/dashboard/admin/transactions`: User Name, Email, Role, Plan, Amount, Transaction ID, Date.

**Shared**: `/dashboard/profile`: update Name, Phone, Bio, profile picture via ImgBB file upload.

### Special pages

- `loading.tsx` (root and dashboard) with skeletons/spinner.
- `not-found.tsx` and `error.tsx` with a clear message and a **Back to Home** button.

---

## 7. Authentication and Authorization (client)

- `lib/auth-client.ts`: `createAuthClient({ baseURL: process.env.NEXT_PUBLIC_API_URL, fetchOptions: { credentials: "include" } })`. Include `inferAdditionalFields` so `role` and `plan` are typed.
- Sign up: pass `role` as an additional field. Sign in via email/password. Toast on success/failure.
- **JWT flow:** after login/session available, call `GET {API}/api/token` (credentials included). The server returns `{ token }`. Cache it in memory (module variable) and also `sessionStorage` as fallback. `lib/api.ts` axios request interceptor attaches `Authorization: Bearer <token>`. On `401`, fetch a fresh token once and retry; if it still fails, sign out and redirect to `/sign-in`.
- On sign out: clear the cached token, call `signOut()`, toast, redirect home.

### Private route guard (CRITICAL: reload must not bounce to login)

```
const { data: session, isPending } = authClient.useSession();
if (isPending) return <FullPageSpinner />;     // NEVER redirect while pending
if (!session) redirect to /sign-in
if (role mismatch) redirect to own dashboard
```

- Implement once in `dashboard/layout.tsx` and a `RoleGuard` component. Role-specific pages check the role from the session user.
- Fetch data only after the token is ready.
- Test: reload on every dashboard route while logged in. It must stay on the page.

---

## 8. Image Upload (ImgBB, Challenge 3)

`lib/imgbb.ts`: POST `FormData` to `https://api.imgbb.com/1/upload?key=KEY` with the file as `image`. Return `data.data.url`.
Use a reusable `ImageUpload` component with preview, size limit (2MB), type check (jpg/png/webp), loading state, error toast. Used on Update Profile and Post/Edit Tuition. Send the resulting URL to the server in the normal JSON body.

---

## 9. API Contract (client calls these; must match server AGENTS.md)

Base: `NEXT_PUBLIC_API_URL`. Protected routes need `Authorization: Bearer <jwt>`.

| Method | Path                                    | Auth                          | Purpose                                                                                  |
| ------ | --------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| ALL    | `/api/auth/*`                           | session                       | BetterAuth (sign-up, sign-in, sign-out, session)                                         |
| GET    | `/api/token`                            | session cookie                | Exchange session for JWT `{ token }`                                                     |
| GET    | `/api/users/me`                         | JWT                           | Current user (role, plan, image...)                                                      |
| PATCH  | `/api/users/me`                         | JWT                           | Update name, phone, bio, image                                                           |
| GET    | `/api/tuitions`                         | public                        | Query: `q, subject, classLevel, mode, page, limit` → `{ data, total, page, totalPages }` |
| GET    | `/api/tuitions/featured`                | public                        | 6 latest approved+active                                                                 |
| GET    | `/api/tuitions/filters`                 | public                        | Distinct subjects/class levels for dropdowns                                             |
| GET    | `/api/tuitions/:id`                     | public                        | Single tuition (approved+active, else 404; owner/admin view via protected route)         |
| POST   | `/api/tuitions`                         | Tutor                         | Create (enforces free limit 2)                                                           |
| GET    | `/api/tutor/tuitions`                   | Tutor                         | My tuitions                                                                              |
| PATCH  | `/api/tuitions/:id`                     | Tutor (owner)                 | Edit                                                                                     |
| PATCH  | `/api/tuitions/:id/toggle-active`       | Tutor (owner)                 | Active/Closed                                                                            |
| DELETE | `/api/tuitions/:id`                     | Tutor (owner)                 | Delete                                                                                   |
| GET    | `/api/tutor/applicants`                 | Tutor                         | Applications to my tuitions                                                              |
| PATCH  | `/api/applications/:id/status`          | Tutor (owner)                 | `accepted` / `rejected`                                                                  |
| GET    | `/api/tutor/stats`                      | Tutor                         | `{ totalPosted, activeApproved, totalApplicants, currentPlan }` overview stats            |
| POST   | `/api/applications`                     | Student                       | Apply (blocks duplicates, returns 409)                                                   |
| GET    | `/api/applications/my`                  | Student                       | My applications                                                                          |
| GET    | `/api/applications/check/:tuitionId`    | Student                       | `{ applied: boolean }`                                                                   |
| DELETE | `/api/applications/:id`                 | Student (owner, pending only) | Cancel                                                                                   |
| GET    | `/api/student/stats`                    | Student                       | `{ total, accepted, pending, plan }` overview stats                                      |
| POST   | `/api/bookmarks/:tuitionId`             | Student                       | Toggle bookmark (optional)                                                               |
| GET    | `/api/bookmarks`                        | Student                       | Saved tuitions (optional)                                                                |
| POST   | `/api/reviews/:tuitionId`               | Student (accepted only)       | Rating 1–5 + feedback (optional)                                                         |
| POST   | `/api/payments/create-checkout-session` | JWT                           | Returns `{ url }`                                                                        |
| GET    | `/api/payments/verify?session_id=`      | JWT                           | Verify, save payment, set plan pro (idempotent)                                          |
| GET    | `/api/admin/stats`                      | Admin                         | Platform stats                                                                           |
| GET    | `/api/admin/users`                      | Admin                         | All users                                                                                |
| PATCH  | `/api/admin/users/:id/role`             | Admin                         | Change role                                                                              |
| GET    | `/api/admin/tuitions`                   | Admin                         | All tuitions (filter by approvalStatus)                                                  |
| PATCH  | `/api/admin/tuitions/:id/approval`      | Admin                         | `approved` / `rejected`                                                                  |
| GET    | `/api/admin/transactions`               | Admin                         | All payments                                                                             |

Error shape from server: `{ message: string }`. Show it in a toast. Handle 401/403/404/409 explicitly.

---

## 10. Data Shapes (TypeScript, put in `types/index.ts`)

```ts
type Role = "student" | "tutor" | "admin";
type Plan = "free" | "pro";
type Approval = "pending" | "approved" | "rejected";
type AppStatus = "pending" | "accepted" | "rejected";

User        { _id, name, email, image?, role, phone?, bio?, plan, createdAt }
Tuition     { _id, title, subject, classLevel, mode: "Online"|"Offline", location, monthlyFee, daysPerWeek,
              bannerImage, description, tutorName, tutorEmail, approvalStatus, isActive, createdAt }
Application { _id, tuitionId, tuitionTitle, subject, monthlyFee, tutorEmail, studentName, studentEmail,
              studentPhone, preferredSchedule, studentNote, status, appliedAt }
Payment     { _id, userEmail, userName, userRole, planName, amount, currency, transactionId,
              stripeSessionId, paymentStatus: "paid", paidAt }
```

---

## 11. UX Rules

- Toast (sonner) for: sign up, sign in, sign out, every create/update/delete, every error.
- Every data page: skeleton while loading, empty state when no data, error state on failure.
- Disable buttons while submitting; prevent double submit.
- Confirm dialog for destructive actions (delete tuition, cancel application).
- Status badges: pending = amber, accepted/approved = green, rejected = red.
- Currency display: `$` with 2 decimals for payments; monthly fee shown in `৳` (BDT) or as configured. Decision logged in section 17.
- Accessibility: labels on inputs, alt on images, visible focus states.

---

## 12. Deployment (Vercel) — Score 0 if broken

- Set all env vars in Vercel. `NEXT_PUBLIC_API_URL` must point to the deployed server (https).
- Add the deployed client URL to the server's CORS and BetterAuth `trustedOrigins`.
- `next.config.ts` `images.remotePatterns` must include every external image host.
- Build must pass locally: `npm run build` with zero TypeScript/ESLint errors before every push to main.
- **Deploy a minimal version on day 1.** Redeploy often.
- Test on production: reload on EVERY route (public + dashboard), logged-in reload on private routes, no CORS/404/504 in the console, landing page loads without errors.
- Use `async` params correctly in Next 15+: `params: Promise<{ id: string }>` and `await params`. `searchParams` likewise.
- Any component using hooks/browser APIs needs `"use client"`.
- Avoid hydration errors: no `Date`/`Math.random` directly in server-rendered markup; guard theme toggle with a mounted check.

---

## 13. Known Pitfalls (do not repeat)

1. Redirecting before `isPending` finishes → logged-in users bounce to login on reload.
2. Using Next middleware to read a cross-domain cookie → does not work.
3. Forgetting `credentials: "include"` → session never sent.
4. Filtering/searching on the client → fails Challenge 1. Must be server-side.
5. Cards with different heights → loses design marks.
6. Using the old Twitter bird icon → loses marks.
7. Committing `.env.local` → critical. Check `.gitignore` first.
8. Hardcoding `localhost` URLs → breaks production.
9. Letting Admin be chosen on sign-up → security hole.
10. `next/image` host not configured → images crash the page.

---

## 14. Optional Features (build in this order, 2–5 required)

1. Server-side pagination on `/tuitions` (planned, do it).
2. Seed data (server side; client just displays it).
3. Dark/Light theme toggle.
4. Bookmark / Saved tuitions tab.
5. Student review and rating (only for accepted applications).

---

## 15. README.md Requirements (client)

Project name, purpose, **live URL**, **Admin credentials**, tutor test credentials, key features, **all npm packages used**, setup instructions, env var names (no values), link to server repo.

---

## 16. Build Order (client)

1. Init Next.js + Tailwind + shadcn, fonts, theme tokens, toaster. Commit. **Deploy to Vercel.**
2. Layout: Navbar, Footer, SectionHeading, Button conventions.
3. Auth client, sign-up, sign-in, token flow, navbar auth state, route guard.
4. Tuition card + Browse page with server-side filters, then Details + Apply.
5. Dashboard layout (collapsible sidebar, topbar), role routing.
6. Student pages → Tutor pages → Admin pages.
7. ImgBB upload component, Profile page.
8. Pricing + Stripe redirect + success/cancel pages.
9. Home page sections and animations.
10. loading/error/not-found, responsive pass, optional features.
11. README, reload test on every route, final deployment check.

---

## 17. Progress Log (AGENT MUST KEEP THIS UPDATED)

### Checklist

- [ ] Repo created, `.gitignore` correct, first deploy live
- [x] Theme tokens, fonts, Toaster
- [x] Navbar
- [x] Footer (X logo)
- [x] Sign up / Sign in
- [x] JWT token flow + axios interceptor
- [x] Route guard (reload-safe)
- [x] Home page layout, hero, featured tuitions, pricing, how it works, and subjects
- [ ] Home page real testimonials and subject counters
- [x] Browse Tuitions (server-side search/filter/pagination)
- [x] Tuition Details + Apply form (role restricted, duplicate-safe)
- [x] Pricing page + Stripe redirect
- [x] Payment success / cancel
- [x] Dashboard layout (collapsible sidebar)
- [x] Student: overview, my-applications
- [x] Tutor: overview
- [x] Tutor: post-tuition, my-tuitions, applicants
- [x] Admin: overview, users, tuitions, transactions
- [x] Profile page + ImgBB upload
- [x] loading.tsx / error.tsx / not-found.tsx
- [x] Dark/Light toggle (optional)
- [x] Bookmarks (optional)
- [ ] Reviews (optional)
- [ ] Responsive check (mobile/tablet/desktop)
- [ ] README complete
- [ ] Reload test on all routes (production)
- [ ] 20+ commits

### Decisions

- Auth route protection is client-side (`isPending` guard). No Next middleware.
- ImgBB upload is done directly from the client with `NEXT_PUBLIC_IMGBB_API_KEY`.
- Stripe flow uses Checkout Session + server-side verification on `/payment/success`.
- UI library: shadcn/ui.
- (Agent: add new decisions here with date.)
- 2026-11-19 — Fonts: Inter for body text and Plus Jakarta Sans for headings.
- 2026-11-19 — Kept the public navbar on public pages and used the screenshot-inspired role-based sidebar only in the dashboard.
- 2026-11-19 — Dashboard pages require a valid BetterAuth session and route users to their own role dashboard.
- 2026-11-19 — Reused the screenshot-inspired sidebar/workspace frame on the public homepage; sidebar links remain public and do not imply an authenticated user.
- 2026-11-19 — Avoided invented learner quotes or subject counts; add those when trusted content/data is available.
- 2026-11-20 — Used existing API contract routes for public tuition search, applications, tutor/admin workflows, profile, and payment verification; no endpoints were invented.
- 2026-11-20 — Kept pricing actions role-aware, and used backend idempotent payment verification on the success page.
- 2026-11-20 — Connected all BetterAuth client methods to the configured backend and require a fresh API JWT before completing sign-in or sign-up.
- 2026-11-21 — Matched the documented local API URL to the Express server's port 8000.
- 2026-11-21 — Verified frontend sign-up page, Better Auth session endpoint, and configured backend credentialed CORS.
- 2026-11-21 — Submitted a unique local student sign-up and confirmed the dashboard session and API JWT were issued.
- 2026-11-20 — Configured the user-provided local backend URL (`http://localhost:8000`) in the ignored `.env.local` for local testing.
- 2026-11-20 — Set Base UI `Button` link renders to `nativeButton={false}` to remove runtime warnings while preserving navigation behavior.
- 2026-11-24 — Added persistent light/dark theme switching and student bookmark state using the existing API contract; kept testimonials and numeric subject counts unclaimed until real content is supplied.
- 2026-11-24 — Matched the student dashboard stats type and display to the server response `{ total, accepted, pending, plan }`.
- 2026-11-24 — Added a student-segment loading boundary so Next.js can render a useful instant-navigation fallback.
- 2026-11-24 — Marked session-protected dashboard routes as non-instant at the server layout boundary and added route fallbacks for redirects and admin navigation.
- 2026-11-24 — Split the admin dashboard into a server route wrapper and client UI, opting out the session-only route from Next.js instant-navigation validation.
- 2026-11-24 — Added an admin route layout opt-out for Next.js instant-navigation validation, covering `/dashboard/admin/users`, `/dashboard/admin/tuitions`, and `/dashboard/admin/transactions`.

### Change Log

- (Agent: add one line per completed task: `YYYY-MM-DD — what changed — files`.)
- 2026-11-19 — Replaced Geist fonts with Inter and Plus Jakarta Sans; added proper body and heading font mappings — `src/app/layout.tsx`, `src/app/globals.css`.
- 2026-11-19 — Added the responsive guest navbar and application theme tokens; integrated the navbar in the root layout — `src/components/layout/Navbar.tsx`, `src/app/layout.tsx`, `src/app/globals.css`.
- 2026-11-19 — Added responsive role-aware dashboard sidebar and workspace header inspired by the provided screenshot — `src/components/layout/DashboardSidebar.tsx`, `src/app/dashboard/layout.tsx`, `src/components/layout/Navbar.tsx`.
- 2026-11-19 — Removed invalid Base UI `nativeButton={false}` settings from menu triggers that render buttons — `src/components/layout/Navbar.tsx`, `src/app/dashboard/layout.tsx`.
- 2026-11-19 — Added BetterAuth sign-up/sign-in, session guard, JWT-backed tutor stats, tutor overview, and local API setup docs — `src/lib/auth-client.ts`, `src/lib/api.ts`, `src/app/sign-in/`, `src/app/sign-up/`, `src/app/dashboard/`, `src/types/index.ts`, `.env.example`, `README.md`.
- 2026-11-19 — Replaced the starter home screen with a responsive dashboard-inspired learning workspace, API-backed featured tuitions, pricing/how-it-works/subjects sections, and local hero illustration — `src/app/page.tsx`, `src/components/home/HomeWorkspace.tsx`, `src/components/layout/Navbar.tsx`, `src/app/layout.tsx`, `next.config.ts`, `public/images/learning-session.svg`.
- 2026-11-20 — Added tuition browsing/details/application, pricing and payment pages, footer, student/tutor/admin/profile workflows, upload helper, and special loading/error/404 states; resolved lint and Next 16 prerender errors — `src/app/`, `src/components/`, `src/lib/data.ts`, `src/lib/imgbb.ts`, `src/types/index.ts`, `src/hooks/use-mobile.ts`, `src/components/ui/carousel.tsx`.
- 2026-11-20 — Fixed BetterAuth backend URL/client instance wiring, exchanged the session for an API JWT after authentication, and documented required backend configuration — `src/lib/auth-client.ts`, `src/app/(auth)/sign-in/page.tsx`, `src/app/(auth)/sign-up/page.tsx`, `.env.example`, `README.md`.
- 2026-11-21 — Updated the documented local API default to match the backend's port 8000 — `AGENTS.md`.
- 2026-11-21 — Confirmed local backend auth and CORS endpoints respond after the backend environment was configured — `.env.local`, `src/lib/auth-client.ts`, `src/app/(auth)/sign-up/page.tsx`.
- 2026-11-21 — Verified sign-up through browser navigation to the student dashboard and confirmed a valid session and API JWT — `src/app/(auth)/sign-up/page.tsx`, `src/lib/api.ts`.
- 2026-11-20 — Set the local API base URL to the user-provided `http://localhost:8000` for upcoming backend testing — `.env.local`.
- 2026-11-20 — Fixed Base UI runtime warning when button-styled navigation links render as anchors — `src/components/layout/Navbar.tsx`, `src/app/tuitions/page.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/dashboard/student/page.tsx`, `src/app/payment/cancel/page.tsx`, `src/app/dashboard/tutor/post-tuition/page.tsx`, `src/app/how-it-works/page.tsx`, `src/components/tuition/ApplyForm.tsx`, `src/components/payment/PaymentVerification.tsx`.
- 2026-11-24 — Completed the student saved-tuitions page, added theme switching and reduced-motion-aware home animations, clarified Free/Pro pricing, streamed tuition data behind Suspense, and refreshed setup/package docs — `src/app/`, `src/components/`, `src/app/globals.css`, `next.config.ts`, `package.json`, `package-lock.json`, `README.md`.
- 2026-11-24 — Fixed the student dashboard invalid-stats error and added its instant-navigation loading fallback — `src/app/dashboard/student/page.tsx`, `src/app/dashboard/student/loading.tsx`, `src/types/index.ts`, `AGENTS.md`.
- 2026-11-24 — Resolved dashboard instant-navigation validation by moving the session guard under a server route-config wrapper, isolating the client redirect, and adding an admin fallback — `src/app/dashboard/layout.tsx`, `src/app/dashboard/DashboardLayoutClient.tsx`, `src/app/dashboard/page.tsx`, `src/app/dashboard/DashboardIndexClient.tsx`, `src/app/dashboard/admin/loading.tsx`, `AGENTS.md`.

### Open Questions / Blockers

- (Agent: list anything needing the developer's input.)
- A unique local student account was created during sign-up verification; session and API JWT work. The server implements `/api/student/stats` with `{ total, accepted, pending, plan }`, now reflected in the client. Rotate credentials previously shared in chat.
- The configured local API at `http://localhost:8000` was unavailable during this turn, so live auth, saved-tuition API behavior, and protected dashboard reloads still need backend-backed verification.
- Live URL, test-account credentials, and the server repository link were not provided; keep these values out of source control until they are available.
