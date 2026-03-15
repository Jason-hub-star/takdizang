# components/
UI 컴포넌트 루트 — 하위 폴더별로 기능 단위 분리.

## Folders
- `ui/` — shadcn/ui 기반 공통 UI 프리미티브
- `layout/` — 앱 공유 레이아웃 (사이드바, 헤더)
- `home/` — Home 화면 전용 컴포넌트
- `editor/` — 노드 에디터 전용 컴포넌트
- `preview/` — 영상 프리뷰 컴포넌트 (Remotion Player)
- `compose/` — 상세페이지 블록 에디터 컴포넌트 (dnd-kit, 13종 블록)

## Convention
- 새 컴포넌트는 기능별 하위 폴더에 배치
- 클라이언트 컴포넌트는 `"use client"` 지시어 필수
- 파일 첫줄에 JSDoc 설명 주석 (`/** ... */`)
