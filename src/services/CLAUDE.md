# services/
Business logic services called by API routes.

## Files
- `brief-parser.ts`: brief text parsing
- `gemini-generator.ts`: Gemini section generation
- `kie-generator.ts`: Kie image generation (legacy direct import, now wrapped by providers/)
- `imagen-generator.ts`: Google Imagen API (legacy, kept for fallback)
- `marketing-script-generator.ts`: Gemini marketing-script generation
- `removebg-service.ts`: remove-background service (legacy, now wrapped by providers/)
- `bgm-analyzer.ts`: BGM analysis
- `byoi-validator.ts`: upload validation
- `section-to-blocks.ts`: section-to-block conversion
- `html-exporter.ts`: block HTML export
- `providers/`: Image generation provider abstraction (see providers/CLAUDE.md)

## Convention
- Keep provider-specific logic here, not in route handlers.
- Routes should orchestrate jobs and persistence; services should generate outputs.
- Image generation routes use `getProvider()` from `providers/registry.ts` — not direct service imports.
- `kie-generator.ts` and `removebg-service.ts` are preserved for `downloadImageAsBase64()` utility and backward compat.
