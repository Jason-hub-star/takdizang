# preview/
Preview-specific components for the browser Remotion experience.

## Files
- `preview-shell.tsx`: ratio selector and preview shell
- `preview-player-loader.tsx`: delayed runtime import boundary
- `remotion-player-runtime.tsx`: the only file allowed to import `@remotion/player`
- `remotion-preview-config.ts`: composition metadata and template mapping
- `shortform-artifact-panel.tsx`: shortform-only preview artifact actions

## Convention
- Keep shell/runtime split intact.
- Do not import `@remotion/player` outside `remotion-player-runtime.tsx`.
- Preview owns shortform artifact generation; result only shows saved outputs.
