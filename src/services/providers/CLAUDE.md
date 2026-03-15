# providers/

Image generation provider abstraction layer.

## Files
- `types.ts`: Provider interface + request/result types
- `registry.ts`: Kie-only provider factory
- `kie-provider.ts`: Kie.ai wrapper (Nano Banana 2 + recraft/remove-background)

## Convention
- All providers implement `ImageGenerationProvider` interface.
- Routes call `getProvider()` from registry — never import providers directly.
- The active image provider is fixed to Kie.ai in this repo.
- Original service files (`kie-generator.ts`, `removebg-service.ts`) are preserved for backward compatibility.
