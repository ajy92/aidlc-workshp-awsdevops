# shared-db - Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. Region 선택 (예: Northeast Asia - ap-northeast-1)
3. Database Password 설정 후 프로젝트 생성 완료 대기

## 2. 스키마 실행

Supabase Dashboard → SQL Editor에서 순서대로 실행:

```bash
# 1) 테이블 + 인덱스 생성
schema.sql 내용 붙여넣기 후 Run

# 2) 시드 데이터 삽입
seed.sql 내용 붙여넣기 후 Run
```

## 3. 연결 정보 확인

Supabase Dashboard → Settings → Database에서:

- **Host**: `db.<project-ref>.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: 프로젝트 생성 시 설정한 비밀번호

### Connection String (Direct)
```
postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

### Connection String (Pooler - 권장)
```
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 4. 환경 변수 설정

customer-app과 admin-app의 `.env.local`에 설정:

```env
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
JWT_SECRET=your-jwt-secret-key-here
```

## 5. 데모 계정

| 구분 | 매장 ID | 사용자명/테이블번호 | 비밀번호 |
|---|---|---|---|
| 관리자 | demo | admin | admin123 |
| 테이블 1~5 | demo | 1~5 | 1234 |

## 주의사항

- seed.sql의 bcrypt 해시는 예시입니다. 앱 최초 실행 시 실제 bcrypt 해시로 교체하는 시드 스크립트를 사용하세요.
- Vercel 배포 시 Connection Pooler URL 사용을 권장합니다 (Serverless 환경 호환).
