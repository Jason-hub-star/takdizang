# thumbnail/
Shortform preview thumbnail API route.

## Files
- `route.ts`: async POST/GET route for generating and polling thumbnail jobs

## Convention
- Only `shortform-video` projects may use this route.
- Persist outputs as `ExportArtifact.type = "thumbnail"`.
