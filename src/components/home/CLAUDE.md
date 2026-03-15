# home/
Home dashboard components for `/`.

## Files
- `home-start-grid.tsx`: shared start-mode grid plus direct upload trigger
- `mode-card.tsx`: project-start card that creates a project and routes onward
- `recent-projects.tsx`: recent project list and state handling

## Convention
- Home start cards must reuse `workspace-hub/start-modes.ts`.
- Keep direct upload entry wired to `DirectUploadLauncher`.
