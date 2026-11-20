# MentorLagbe Client

MentorLagbe is a tuition and mentorship platform for students, tutors, and admins. This repository contains the Next.js client.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set the API URL and any required public keys.
3. Run `npm run dev`, then open [http://localhost:3000](http://localhost:3000).

Protected dashboard pages use the backend BetterAuth session and JWT endpoints. Configure `NEXT_PUBLIC_API_URL` and run the matching MentorLagbe server before signing in.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | MentorLagbe server URL |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ImgBB image upload key |
| `NEXT_PUBLIC_SITE_URL` | Client site URL |

## npm packages

Runtime packages: `@base-ui/react`, `@shadcn/react`, `axios`, `better-auth`, `class-variance-authority`, `cmdk`, `cn`, `date-fns`, `embla-carousel-react`, `input-otp`, `lucide-react`, `next`, `react`, `react-day-picker`, `react-dom`, `react-icons`, `react-resizable-panels`, `recharts`, `shadcn`, `shiki`, `sonner`, `tw-animate-css`.

Development packages: `@tailwindcss/turbopack`, `@types/node`, `@types/react`, `@types/react-dom`, `babel-plugin-react-compiler`, `eslint`, `eslint-config-next`, `tailwindcss`, `typescript`.

## Available scripts

- `npm run dev` — start the development server.
- `npm run lint` — run ESLint.
- `npm run build` — create a production build.

## Deployment and test accounts

The production URL and test credentials are not configured in this repository yet. Do not store credentials in this README; share them through a secure channel when available.

Server repository: not configured yet.
