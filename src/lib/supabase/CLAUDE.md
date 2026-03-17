# lib/supabase/
Supabase client setup for Takdizang auth and data access.

## Files
- `admin.ts`: service_role admin client — bypasses RLS, for background jobs and migrations
- `server.ts`: cookie-based server client — for API routes and SSR pages (respects RLS)
- `browser.ts`: browser client — for CSR components (respects RLS)
- `storage.ts`: Supabase Storage upload/download/delete helpers behind the `/uploads` public path contract

## Convention
- Use `server.ts` for authenticated API routes and SSR pages.
- Use `admin.ts` only for background jobs, migrations, or when bypassing RLS is intentional.
- Use `browser.ts` in client components for auth state and real-time subscriptions.
- Query shaping lives in `src/lib/prisma.ts`.
