# 시간대별 주문 데이터 Bar Chart 요구사항

## 개요
관리자 대시보드의 매출 화면에서 선택한 기간 동안의 시간대별 주문 데이터를 bar chart 그래프로 시각화합니다.

## 기능 요구사항

### FR-1: 시간대별 주문 데이터 시각화
- 매출 탭에서 선택한 기간(시작일~종료일)의 시간대별 주문 건수를 bar chart로 표시
- X축: 시간대 (8시~23시)
- Y축: 주문 건수
- 각 막대에 마우스 오버 시 정확한 주문 건수 표시

### FR-2: 차트 라이브러리 사용
- Recharts 라이브러리를 사용하여 반응형 bar chart 구현
- 깔끔하고 직관적인 디자인 적용

## 기술 요구사항

### TR-1: 기존 데이터 활용
- 현재 `/api/dashboard/sales` API에서 제공하는 `byHour` 데이터 활용
- 추가 API 개발 불필요

### TR-2: 컴포넌트 구조
- 기존 dashboard page.tsx 수정
- Recharts의 BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer 사용

## 제약사항
- 기존 대시보드 레이아웃 및 다른 기능에 영향 없이 구현
- 시간대별 주문 섹션만 개선
