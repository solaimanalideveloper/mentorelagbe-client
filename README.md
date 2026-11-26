# MentorLagbe Client

MentorLagbe is a tuition and mentorship platform for students, tutors, and admins. This repository contains the responsive Next.js client for browsing tuitions, managing role-based dashboards, and upgrading plans with Stripe Checkout.

## Features

- Browse approved tuitions with server-side search, filters, and pagination.
- Apply to tuitions as a student and manage student, tutor, and admin workflows.
- Create and manage tutor listings, including ImgBB image uploads.
- Compare Free and Pro plans, start Stripe Checkout, and verify completed payments.
- Save tuition listings, switch between light and dark themes, and use responsive navigation.
- Authenticate through the MentorLagbe server with BetterAuth sessions and API JWTs.

## Local setup

1. Install dependencies with `npm install`.
2. Create an ignored `.env` file in the project root and set the required variables listed below.
3. Run `npm run dev`, then open [http://localhost:3000](http://localhost:3000).

Authentication and protected dashboard pages use the BetterAuth session and JWT endpoints hosted by the MentorLagbe server. Set `NEXT_PUBLIC_API_URL` to that server's base URL; the server must allow credentialed requests from `NEXT_PUBLIC_SITE_URL` and trust that site as an auth origin before sign-in or sign-up can work. The server must also implement the API contract documented in [AGENTS.md](./AGENTS.md).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | MentorLagbe server URL |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ImgBB image upload key |
| `NEXT_PUBLIC_SITE_URL` | Client site URL |

The local `.env` may also contain server-only authentication and database settings required by the local auth API. Keep all environment files private and out of version control.

## npm packages

Runtime packages: `@base-ui/react`, `@better-auth/mongo-adapter`, `@shadcn/react`, `axios`, `better-auth`, `class-variance-authority`, `cmdk`, `cn`, `date-fns`, `embla-carousel-react`, `framer-motion`, `input-otp`, `lucide-react`, `mongodb`, `next`, `next-themes`, `react`, `react-day-picker`, `react-dom`, `react-icons`, `react-resizable-panels`, `recharts`, `shadcn`, `shiki`, `sonner`, `tw-animate-css`.

Development packages: `@tailwindcss/turbopack`, `@types/node`, `@types/react`, `@types/react-dom`, `babel-plugin-react-compiler`, `eslint`, `eslint-config-next`, `tailwindcss`, `typescript`.

## Available scripts

- `npm run dev` — start the development server.
- `npm run lint` — run ESLint.
- `npm run build` — create a production build.

## Deployment and test accounts

| Item | Status |
| --- | --- |
| Live client URL | Not provided |
| Admin test account | Not provided; share credentials through a secure channel, not source control |
| Tutor test account | Not provided; share credentials through a secure channel, not source control |
| Server repository | Not provided |

Add the deployed URL and server repository link before release. Never commit account passwords or other secrets.
