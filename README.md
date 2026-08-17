# Next.js Auth + RBAC Demo

A small, self-contained Next.js (App Router) + TypeScript project demonstrating:

- **Auth** via JWT stored in an `httpOnly` cookie (`jose` for signing/verifying — Edge-runtime safe)
- **Role-based access control** (`admin` / `user`) enforced in `middleware.ts`
- **SSR session check** — each dashboard page is a Server Component that re-verifies
  the session on the server before rendering (defense in depth on top of middleware)
- **Axios interceptors** (`src/lib/axios.ts`) — auto-attaches cookies (`withCredentials`)
  and globally redirects to `/login` on `401` responses
- Separate **Admin** and **User** dashboards with a small mock "users" table

## Getting started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Visit `http://localhost:3000` — it redirects to `/login` if you're not signed in,
or straight to your dashboard if you are.

## Demo accounts

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | `admin`  | `admin123`|
| User  | `user`   | `user123` |

## How the auth flow works

1. `POST /api/auth/login` checks credentials against the mock user list
   (`src/lib/users.ts`), signs a JWT with `{ id, username, name, role }`,
   and sets it as an `httpOnly`, `sameSite=lax` cookie named `session`.
2. `src/middleware.ts` runs on every request to `/admin/*` and `/user/*`.
   It reads the cookie, verifies the JWT, and:
   - redirects to `/login` if there's no/invalid session
   - redirects to the user's *own* dashboard if the role doesn't match the route
3. Each dashboard (`src/app/admin/dashboard/page.tsx`,
   `src/app/user/dashboard/page.tsx`) is a **Server Component** that reads
   `cookies()` and re-verifies the session **server-side before render** —
   so even if middleware were ever bypassed, the page itself won't render
   without a valid, correctly-scoped session.
4. `POST /api/auth/logout` clears the cookie.
5. `src/lib/axios.ts` is the single HTTP client used by the UI. Its response
   interceptor watches for `401`s and redirects to `/login` automatically,
   so individual components don't need to handle that case.

## Project structure

```
src/
  app/
    login/                 # Login page (client component)
    admin/dashboard/       # Admin-only dashboard (server component)
    user/dashboard/        # User-only dashboard (server component)
    api/auth/
      login/route.ts       # Sets the session cookie
      logout/route.ts      # Clears the session cookie
      me/route.ts          # Returns the current session payload
    page.tsx                # Root — SSR redirect based on session/role
    layout.tsx
    globals.css
  components/
    LogoutButton.tsx
  lib/
    auth.ts                # JWT sign/verify (jose)
    users.ts                # Mock user "database"
    axios.ts                # Axios instance + interceptors
  middleware.ts             # Route-level RBAC guard (runs at the edge)
  styles/
    dashboard.module.css
```

## Notes for production use

This is a minimal demo, so a few things are simplified on purpose:

- Passwords are plain text in `src/lib/users.ts` — swap in a real database
  and hash passwords with `bcrypt`/`argon2`.
- `JWT_SECRET` in `.env.local.example` is a placeholder — always set a
  strong, unique secret via environment variables in real deployments.
- There's no refresh-token flow — sessions simply expire after 2 hours.
