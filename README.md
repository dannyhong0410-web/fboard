# FBoard - Financial Dashboard

다양한 금융 지표들을 한눈에 볼 수 있는 웹 대시보드입니다.

## 주요 기능

- **Stock**: 주식 시장 지표 (S&P 500, NASDAQ, DOW JONES, VIX, KOSPI, KOSDAQ)
- **Fixed Income**: 채권 시장 지표 (미국, 독일, 일본, 한국 국채 수익률)
- **FX**: 외환 시장 지표 (USD/KRW, EUR/USD, USD/JPY 등)
- **Commodity**: 상품 시장 지표 (금, 은, 원유, 구리, 천연가스)
- **Credit**: 신용 시장 지표 (CDS, 신용 스프레드)
- **Macro**: 거시경제 지표 (GDP, 인플레이션, 실업률, 금리)

## 기술 스택

- React 18
- React Router DOM
- Styled Components
- Modern CSS Grid & Flexbox

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm start
```

3. 브라우저에서 `http://localhost:3000` 접속

## 프로젝트 구조

```
src/
├── components/
│   ├── HomePage.js          # 메인 홈페이지
│   ├── PageLayout.js        # 공통 페이지 레이아웃
│   ├── StockPage.js         # 주식 시장 페이지
│   ├── FixedIncomePage.js   # 채권 시장 페이지
│   ├── FXPage.js            # 외환 시장 페이지
│   ├── CommodityPage.js     # 상품 시장 페이지
│   ├── CreditPage.js        # 신용 시장 페이지
│   └── MacroPage.js         # 거시경제 페이지
├── App.js                   # 메인 앱 컴포넌트
└── index.js                 # 앱 진입점
```

## 특징

- 🎨 모던하고 반응형 디자인
- 📱 모바일 친화적 UI
- 🚀 빠른 페이지 전환
- 💫 부드러운 애니메이션 효과
- 🌈 직관적인 색상 코딩 (상승/하락)

## 향후 개발 계획

- 실시간 데이터 연동
- 차트 라이브러리 통합 (Chart.js, D3.js)
- 사용자 커스터마이징 기능
- 알림 및 위젯 기능
- 다크/라이트 테마 전환 