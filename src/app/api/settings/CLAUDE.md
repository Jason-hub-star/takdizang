# api/settings/
Settings API — 프로필, 워크스페이스, 비밀번호 관리.

## Routes
- `profile/route.ts`: GET/PATCH 프로필 (displayName 수정)
- `profile/avatar/route.ts`: POST 아바타 업로드 (FormData, max 2MB)
- `workspace/route.ts`: PATCH 워크스페이스 이름 변경
- `password/route.ts`: POST 비밀번호 변경 (현재PW 검증 → 새PW 설정)

## Convention
- 모든 라우트에 `getAuthContext()` 인증 가드 적용
- OAuth 전용 계정은 비밀번호 변경 거부 (400)
- profiles 행이 없는 기존 사용자는 PATCH/POST에서 upsert 처리
- 에러 메시지는 해요체 한국어
