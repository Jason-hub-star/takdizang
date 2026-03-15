# layout/
Shared chrome and global overlays.

## Files
- `app-layout.tsx`: sidebar + header wrapper
- `app-header.tsx`: header actions and overlay entry points
- `app-sidebar.tsx`: primary navigation
- `global-debug-nav.tsx`: local debug page switcher
- `global-start-launcher.tsx`: global start modal
- `direct-upload-launcher.tsx`: shared staged upload hub

## Convention
- All non-editor pages should use `AppLayout`.
- Home and header `직접 업로드` must stay unified through `DirectUploadLauncher`.
