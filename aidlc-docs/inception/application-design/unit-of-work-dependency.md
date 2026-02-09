# Unit of Work Dependencies

## Dependency Matrix

| Unit | Depends On | Dependency Type | 비고 |
|---|---|---|---|
| shared-db | (없음) | — | 선행 조건 없음 |
| customer-app | shared-db | Data (DB 스키마) | DB 스키마 존재해야 API 동작 |
| admin-app | shared-db | Data (DB 스키마) | DB 스키마 존재해야 API 동작 |
| customer-app | admin-app | Indirect (DB 경유) | 직접 의존 없음, 공유 DB로 데이터 동기화 |

## 개발 순서

```
Phase 1: shared-db
   |
   +---> Phase 2a: customer-app  (병렬 가능)
   |
   +---> Phase 2b: admin-app     (병렬 가능)
   |
   +---> Phase 3: 통합 테스트 + 배포
```

## Construction Phase 실행 순서

1. **Unit 1: shared-db** → Functional Design → Code Generation
2. **Unit 2: customer-app** → Functional Design → Infrastructure Design → Code Generation
3. **Unit 3: admin-app** → Functional Design → Infrastructure Design → Code Generation
4. **Build and Test** (전체)
