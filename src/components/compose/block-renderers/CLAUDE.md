# block-renderers/
18종 블록 렌더러 — 개별 파일 + barrel export.

## Files
- `index.ts` — barrel export (18종 전체)
- `hero-block.tsx` — 히어로 (ImageUploadZone + 오버레이 드래그 위치 편집 + fontFamily + ResizeObserver 반응형 폰트)
- `selling-point-block.tsx` — 핵심 장점 (12종 아이콘 선택 + 항목 추가/삭제, 최대 4개 안내)
- `text-block.tsx` — 텍스트 (EditableText 제목 + 본문 + fontFamily)
- `image-text-block.tsx` — 이미지+텍스트 (ImageUploadZone + EditableText + fontFamily)
- `image-full-block.tsx` — 전체 이미지 (ImageUploadZone + 오버레이 + fontFamily + ResizeObserver 반응형 폰트)
- `image-grid-block.tsx` — 이미지 그리드 (셀별 ImageUploadZone + 캡션 + 추가/삭제)
- `spec-table-block.tsx` — 스펙 테이블 (행별 인라인 편집 + 추가/삭제)
- `comparison-block.tsx` — 비교 (Before/After ImageUploadZone + 라벨)
- `review-block.tsx` — 리뷰 (3가지 displayStyle + 별점 클릭 + 추가/삭제)
- `divider-block.tsx` — 구분선 (line/space/dot)
- `video-block.tsx` — 영상 (VideoUploadZone + 포스터 이미지)
- `cta-block.tsx` — 구매 유도 (4종 스타일 프리셋 + 커스텀 색상, placeholder "보조 문구")
- `usage-steps-block.tsx` — 사용 방법 (번호 + 이미지 + 라벨 + 설명, 추가/삭제, 최대 6개)
- `faq-block.tsx` — FAQ (질문+답변 아코디언, 추가/삭제, 최대 10개)
- `notice-block.tsx` — 공지/안내 (아이콘+텍스트 리스트, 8종 아이콘, 추가/삭제, 최대 8개)
- `banner-strip-block.tsx` — 띠배너 (전체폭 배경색+텍스트+보조문구)
- `price-promo-block.tsx` — 가격/프로모션 (정가·할인가·할인율 자동 계산·뱃지·기간)
- `trust-badge-block.tsx` — 인증/뱃지 (10종 아이콘, 추가/삭제, 최대 8개)

## Convention
- 공용 컴포넌트: `../shared/` (EditableText, ImageUploadZone 등)
- Props: `{ block, selected, onSelect, onUpdate, readOnly? }`
- 블록 타입: `src/types/blocks.ts` 정의 참조
- 선택 테두리: `border-indigo-500` / `border-transparent`
- 새 렌더러 추가 시 서브에이전트로 기존 패턴 수집 후 작업 (skill: `subagent-pattern-collect`)
- 새 렌더러 추가 시 `index.ts`, `block-canvas.tsx`, `block-properties-panel.tsx`, `block-palette.tsx` 동시 업데이트
