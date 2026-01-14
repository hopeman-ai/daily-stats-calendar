# 요즘 어때? 📅

**나를 보는 캘린더** - 하루의 짧은 기록을 따뜻한 한 문장으로 정리해주는 서비스

[![GitHub Pages](https://img.shields.io/badge/Live-GitHub%20Pages-success)](https://hopeman-ai.github.io/daily-stats-calendar/)

## ✨ 주요 기능

### 1. 📝 하루 기록
- **에너지 상태** 기록 (높음 🔥 / 보통 ⚡ / 낮음 🌙)
- **하루 태그** 입력 (1-2개, 예: #집중 #휴식)
- **메모** 작성 (선택)

### 2. 💬 따뜻한 한 문장 생성
오늘만 보지 않고 최근 며칠의 흐름을 반영한 따뜻한 문장을 자동 생성합니다.

**예시:**
- "요즘 계속 힘든 시간이었던 걸 생각하면, 오늘도 쉽지 않았을 것 같아. 그래도 여기까지 온 걸로 충분해."
- "최근 며칠을 보면, 오늘도 너 나름대로 하루를 채운 것 같아."

**특징:**
- 최근 7일 데이터 분석
- "요즘", "최근", "계속" 등 연속성 표현
- 따뜻하고 존재를 인정하는 톤
- 40+ 다양한 문장 패턴

### 3. 📤 선택적 SNS 공유
- **📋 문장 복사**: 클립보드에 복사
- **📤 원하면 공유**: 이미지 카드 자동 생성 (Web Share API 지원)

### 4. 📊 통계 및 분석
- 최근 7일/30일 에너지 분포
- 자주 등장한 태그 순위
- 자연어 해석 및 인사이트

## 🚀 사용 방법

### 온라인에서 바로 사용
**👉 [https://hopeman-ai.github.io/daily-stats-calendar/](https://hopeman-ai.github.io/daily-stats-calendar/)**

### 로컬에서 사용
```bash
git clone https://github.com/hopeman-ai/daily-stats-calendar.git
```
그 후 `index.html` 파일을 브라우저에서 열기

## 📚 가이드 문서

- [SHARE_FEATURE_GUIDE.md](SHARE_FEATURE_GUIDE.md) - 공유 기능 사용법
- [WARM_SENTENCE_GUIDE.md](WARM_SENTENCE_GUIDE.md) - 따뜻한 문장 생성 설명

## 🔒 개인정보 보호

- ✅ 모든 데이터는 브라우저 로컬 저장소에만 저장
- ✅ 서버 전송 없음, 로그인 불필요
- ✅ 공유 이미지에 개인정보 미포함

## 🛠️ 기술 스택

- 순수 HTML/CSS/JavaScript
- localStorage (데이터 저장)
- Canvas API (이미지 생성)
- Web Share API (모바일 공유)

---

Copyright 2026. Heeseok Choi
