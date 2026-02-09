# 시간대별 주문 Bar Chart 구현

## 구현 개요
관리자 대시보드의 매출 화면에 Recharts 라이브러리를 사용하여 시간대별 주문 데이터를 bar chart로 시각화했습니다.

## 구현 내용

### 1. 라이브러리 설치
```bash
npm install recharts
```

### 2. 수정된 파일
- `/admin-app/src/app/dashboard/page.tsx`

### 3. 주요 변경사항

#### 3.1 Import 추가
```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
```

#### 3.2 시간대별 주문 섹션 개선
- 기존: 단순 div 기반 막대 그래프
- 변경: Recharts BarChart 컴포넌트 사용
- 데이터 변환: `{ hour: "8시", count: 5 }` 형식으로 매핑
- 반응형 컨테이너 적용 (ResponsiveContainer)
- 그리드, 축, 툴팁 추가

#### 3.3 컴포넌트 이름 충돌 해결
- 로컬 `Bar` 컴포넌트를 `BarItem`으로 변경
- Recharts의 `Bar` 컴포넌트와 충돌 방지

## 기능 설명

### Bar Chart 구성요소
- **X축**: 시간대 (8시~23시)
- **Y축**: 주문 건수
- **CartesianGrid**: 배경 그리드 (점선)
- **Tooltip**: 마우스 오버 시 정확한 주문 건수 표시
- **Bar**: 파란색 막대 (#3b82f6), 상단 모서리 둥글게 처리

### 스타일링
- 높이: 200px
- 툴팁: 흰색 배경, 회색 테두리, 둥근 모서리
- 폰트 크기: 12px (축 레이블)

## 테스트 결과
- ✅ 빌드 성공
- ✅ 타입 체크 통과
- ✅ 기존 기능 영향 없음

## 다음 단계
- 로컬 개발 서버에서 시각적 확인
- 다양한 기간 선택 시 차트 동작 확인
