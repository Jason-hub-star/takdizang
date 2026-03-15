# lib/
Shared utilities and runtime helpers.

## Files
- `api-client.ts`: typed browser fetch wrappers
- `api-response.ts`: route response helpers
- `constants.ts`: shared flow/editor constants
- `project-contract.ts`: runtime validators for project modes and artifact types
- `project-media.ts`: project sections, image paths, and artifact lookup helpers
- `save-generated-image.ts`: generated image persistence
- `save-artifact-file.ts`: text artifact persistence
- `runtime-paths.ts`: deployment-aware uploads and runtime path helpers
- `prisma.ts`: Supabase-backed Prisma compatibility adapter
- `supabase/admin.ts`: server-side Supabase client factory
- `supabase/storage.ts`: `/uploads` public path to Supabase Storage bridge
- `workspace-guard.ts`: workspace scope enforcement

## Convention
- Keep business logic in `services/` when it talks to providers.
- Reuse `project-contract.ts` for server-side contract validation.
