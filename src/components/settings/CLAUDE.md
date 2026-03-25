# settings/
설정 페이지 전용 컴포넌트.

## Files
- `settings-shell.tsx`: 탭 컨테이너 (shadcn Tabs variant="line", URL hash 동기화)
- `account-section.tsx`: 내 계정 탭 (프로필 편집, 비밀번호, 연결 계정, 위험 영역)
- `usage-section.tsx`: 사용량 탭 (월간 개요, 타입별 프로그레스바, 최근 이력)
- `workspace-section.tsx`: 워크스페이스 탭 (이름 편집, ID 복사, 통계, 멤버 placeholder)
- `provider-section.tsx`: AI 프로바이더 탭 (Kie.ai/Gemini/Remotion 연결 상태)

## Convention
- 서버 컴포넌트(page.tsx)에서 `getSettingsPageData()` 호출 후 `SettingsShell`에 전달
- 각 섹션은 `data: SettingsPageData`를 props로 받음
- API 호출은 `api-client.ts`의 Settings 함수 사용
- 공유 컴포넌트(SummaryCard, InlineEdit, UsageProgressBar)는 `shared/`에서 import
