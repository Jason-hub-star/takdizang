# ui/
shadcn/ui 기반 공통 UI 프리미티브.

## Files
- `button.tsx` — shadcn Button (variant: default/outline/ghost/destructive/link)
- `card.tsx` — shadcn Card (Header/Title/Description/Content/Footer)
- `badge.tsx` — shadcn Badge (variant: default/secondary/destructive/outline)
- `tabs.tsx` — shadcn Tabs (variant: default/line)
- `scroll-area.tsx` — shadcn ScrollArea
- `separator.tsx` — shadcn Separator
- `sonner.tsx` — shadcn Sonner 토스트 알림 (sonner 래퍼)
- `status-badge.tsx` — 커스텀 프로젝트 상태 배지 (초안/생성 중/생성 완료/내보내기 완료/실패)

## Convention
- shadcn 컴포넌트는 `npx shadcn@latest add <name>`으로 설치
- 직접 수정보다 className 오버라이드 권장
- 커스텀 UI는 이 폴더에 `status-badge.tsx`처럼 추가
