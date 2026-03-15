# lib/supabase/
Supabase runtime helpers used by the copied Takdi app.

## Files
- `admin.ts`: server-side Supabase client for route handlers, pages, and compatibility adapters
- `storage.ts`: Supabase Storage upload/download/delete helpers behind the `/uploads` public path contract

## Convention
- Keep browser/session auth helpers out of this folder until auth is reintroduced.
- Use this folder for direct Supabase client setup only; query shaping lives in `src/lib/prisma.ts`.
