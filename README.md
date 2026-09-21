# QR Styler

URL을 입력해 스타일이 적용된 QR코드를 만들고 이미지로 저장하는 웹앱입니다.

## 기능

- URL 입력 → 스타일/색상 선택 → QR코드 생성 → PNG/SVG로 저장하는 단일 흐름입니다.
- QR코드는 항상 우리 서비스의 리디렉션 주소(`/q/[slug]`)를 인코딩하고, 실제 연결 URL은 DB에 저장됩니다. 생성 시 발급되는 **관리 링크**를 저장해두면, 나중에 연결 URL이 바뀌어도 **같은 QR코드 이미지**를 계속 쓸 수 있습니다. 관리 링크가 필요 없다면 그냥 무시하면 됩니다.
- **스타일 3종**: 기본 / 둥근 버전 / 이쁜 도형 (`qr-code-styling` 기반, `src/lib/qr-presets.ts`에서 정의), 색상 직접 선택 가능
- 여러 개를 만들 때 관리 링크를 구분할 수 있도록 이름(라벨)을 붙일 수 있습니다.

## 동작 방식

1. `POST /api/qr` → Supabase RPC `create_qr_code`가 `slug`(공개 식별자)와 `edit_token`(관리자만 아는 비밀 토큰)을 생성해 저장
2. QR코드는 `https://<도메인>/q/<slug>`를 인코딩
3. 스캔 시 `GET /q/[slug]`가 DB에서 현재 연결 URL을 조회해 302 리디렉션
4. 관리 링크(`/edit/[slug]?token=...`)에서 `edit_token`을 검증한 뒤 연결 URL(과 이름)을 갱신

DB 접근은 전부 `SECURITY DEFINER` Postgres 함수(`create_qr_code`, `get_qr_code_for_edit`, `update_qr_code`, `resolve_qr_code`)를 통해서만 이루어지며, `qr_codes` 테이블은 RLS가 켜져 있고 직접 접근을 허용하는 정책이 없습니다. 그래서 브라우저에 노출해도 안전한 `anon` 키만으로 동작하며, 서비스 롤 키가 필요 없습니다.

추후 로그인 기능을 붙일 때는 `qr_codes.user_id` 컬럼과 `auth.uid() = user_id` 기반 RLS 정책을 추가하면, 익명 사용자는 `edit_token`으로, 로그인 사용자는 계정으로 QR코드를 관리하도록 확장할 수 있습니다.

## 개발 환경 설정

```bash
cp .env.example .env.local
# .env.local 에 Supabase 프로젝트의 URL과 anon/publishable 키를 채워주세요
npm install
npm run dev
```

## 배포

Vercel 등에 배포할 때 위 두 환경변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)를 프로젝트 환경변수로 등록하세요.
