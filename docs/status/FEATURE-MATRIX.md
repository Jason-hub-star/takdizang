# Feature Matrix

Last Updated: 2026-03-15 (KST, Supabase storage migration + docs process import)
Status enum: `Not Started | In Progress | Done | Blocked | Deferred`

| ID | Feature | Status | Owner | Notes |
|---|---|---|---|---|
| DOCS-001 | Takdi-style docs process import | Done | codex | Root `CLAUDE.md` + `docs/status` + `docs/ref` added for Takdizang |
| INFRA-001 | Takdi UI/route copy into separate repo | Done | codex | Public repo keeps Takdi screens and route structure while reserving `/landing` |
| INFRA-002 | Supabase-backed Prisma compatibility adapter | Done | codex | `src/lib/prisma.ts` now maps copied app data access onto Supabase |
| INFRA-003 | Prisma removal from runtime | Done | codex | Runtime uses Supabase directly; Prisma is no longer part of active app persistence |
| INFRA-004 | Ollama removal | Done | codex | Local LLM dependency removed from Takdizang |
| INFRA-005 | ComfyUI removal | Done | codex | Local image provider stack removed from Takdizang |
| INFRA-006 | Kie-only image provider registry | Done | codex | Provider registry now favors Kie for image generation/background flows |
| INFRA-007 | Supabase storage buckets | Done | codex | Added `project-assets`, `artifacts`, `thumbnails` bucket bootstrap migration |
| INFRA-008 | `/uploads` proxy over Supabase Storage | Done | codex | Existing UI still consumes `/uploads/...` while backend serves from Storage |
| INFRA-009 | Project deletion storage cleanup | Done | codex | DB delete now clears storage prefix after relational cleanup |
| QA-001 | Storage smoke test | Done | codex | Project create/upload/view/delete validated against Supabase Storage |
| QA-002 | Thumbnail artifact smoke | Blocked | codex | Blocked by Kie credit insufficiency |
| QA-003 | Marketing-script artifact smoke | Blocked | codex | Blocked by leaked/disabled Gemini API key |
| QA-004 | Export artifact smoke | In Progress | codex | Waiting on upstream thumbnail/script providers to complete full artifact set |
| LANDING-001 | Custom marketing landing page | Deferred | unassigned | `/landing` intentionally left open for later design work |
