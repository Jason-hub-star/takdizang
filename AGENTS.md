# Takdizang Orchestration Index

Automation-first documentation index for Takdizang.

## Repo Boundary
- Write repo: `.` (이 AGENTS.md가 위치한 디렉토리가 루트)

## Context Loading Order
1. `AGENTS.md` (this file)
2. `docs/status/Codex-HANDOFF.md`
3. `docs/status/PROJECT-STATUS.md`
4. `docs/status/FEATURE-MATRIX.md`
5. `docs/ref/ARCHITECTURE.md`
6. `docs/ref/SCHEMA-INDEX.md`

## Execution Rules
1. Keep `PROJECT-STATUS.md` and `FEATURE-MATRIX.md` in sync.
2. Preserve Takdi-compatible route and type contracts unless an intentional infra change is required.
3. Record validation commands for every infrastructure or API change.
4. New folders should include a local `AGENTS.md` describing structure and conventions.
5. Keep long-lived specs in `docs/ref`; use `docs/status` for current state and handoff only.

## Product Direction
- Keep the copied `takdi` UI and feature flow working in a separate repo.
- Use Supabase for runtime data and Supabase Storage for persisted uploads/artifacts.
- Keep Kie.ai, Gemini, and Remotion in place.
- Leave `/landing` free for a future custom marketing page.

## Source of Truth
- Current runtime/handoff: `docs/status/Codex-HANDOFF.md`
- Current status: `docs/status/PROJECT-STATUS.md`
- Feature ledger: `docs/status/FEATURE-MATRIX.md`
- Architecture notes: `docs/ref/ARCHITECTURE.md`
- Schema/API/storage contract: `docs/ref/SCHEMA-INDEX.md`
