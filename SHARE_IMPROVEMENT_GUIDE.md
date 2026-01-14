# 공유 기능 개선 적용 가이드

## 📝 개요

현재 공유 기능이 **이미 구현되어 있지만**, 다음 문제점들을 개선합니다:
- ❌ 한글 줄바꿈 처리 부족 (공백 기준만 사용)
- ❌ 폰트 문제 ('Segoe UI'는 한글 렌더링 부자연스러움)
- ❌ 단조로운 디자인

## ✨ 개선 사항

### 1. 한글 텍스트 처리
- 문자 단위 정확한 줄바꿈
- 한글 폰트 사용 ('맑은 고딕', 'Apple SD Gothic Neo')

### 2. 디자인 개선
- 그라디언트 배경
- 카드 그림자 효과
- 1080x1080 정사각형 (인스타그램 최적화)

### 3. 사용자 경험
- 더 명확한 피드백 메시지
- Web Share API 완벽 지원
- 모바일/PC 최적화

## 🔧 적용 방법

### Option 1: 자동 패치 (권장)

간단한 패치 스크립트를 실행합니다:

```bash
cd daily-stats-calendar
python apply_share_patch.py
```

### Option 2: 수동 적용

#### Step 1: 백업
```bash
cp index.html index.html.before_share_fix
```

#### Step 2: 함수 교체

`index.html`에서 다음 함수들을 찾아서 `improved-share-functions.js`의 해당 함수로 교체합니다:

**교체할 함수 목록:**
1. `copySummaryToClipboard()` - 줄 1329 근처
2. `generateShareImage()` - 줄 1347 근처
3. `downloadImage()` - 줄 1413 근처

**추가할 함수 (generateShareImage 다음에):**
4. `wrapKoreanText()` - 새로 추가
5. `shareOrDownloadImage()` - 새로 추가

#### Step 3: 함수별 상세 교체 방법

##### 1. copySummaryToClipboard() 교체

**찾기 (1329줄 근처):**
```javascript
async copySummaryToClipboard() {
    const summaryText = document.getElementById('summary-text').textContent;

    try {
        await navigator.clipboard.writeText(summaryText);
        alert('문장이 복사되었습니다.');
    } catch (err) {
        // 폴백: textarea 사용
        const textarea = document.createElement('textarea');
        textarea.value = summaryText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('문장이 복사되었습니다.');
    }
}
```

**교체:**
```javascript
async copySummaryToClipboard() {
    const summaryText = document.getElementById('summary-text').textContent;

    try {
        await navigator.clipboard.writeText(summaryText);
        alert('✅ 문장이 복사되었습니다.\n원하는 곳에 붙여넣기하세요!');
    } catch (err) {
        // 폴백: textarea 사용 (iOS, 구형 브라우저)
        const textarea = document.createElement('textarea');
        textarea.value = summaryText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            alert('✅ 문장이 복사되었습니다.\n원하는 곳에 붙여넣기하세요!');
        } catch (e) {
            alert('❌ 복사에 실패했습니다.\n수동으로 문장을 복사해주세요.');
        } finally {
            document.body.removeChild(textarea);
        }
    }
}
```

##### 2. generateShareImage() 교체

**찾기 (1347줄 근처):**
```javascript
generateShareImage() {
    const canvas = document.getElementById('share-canvas');
    const ctx = canvas.getContext('2d');
    const summaryText = document.getElementById('summary-text').textContent;

    // 배경
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 600);

    // ... 기존 코드 ...

    // 이미지 다운로드 또는 공유
    canvas.toBlob((blob) => {
        const file = new File([blob], 'daily-summary.png', { type: 'image/png' });

        // Web Share API 지원 확인
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
                files: [file],
                title: '오늘의 한 문장',
                text: summaryText
            }).catch(err => {
                // 공유 취소 시 다운로드
                this.downloadImage(canvas);
            });
        } else {
            // Web Share API 미지원 시 다운로드
            this.downloadImage(canvas);
        }
    });
}
```

**교체 (`improved-share-functions.js` 파일의 generateShareImage 함수 전체 복사)**

##### 3. wrapKoreanText() 추가

`generateShareImage()` 함수 **바로 다음**에 추가:

```javascript
wrapKoreanText(ctx, text, maxWidth, fontSize) {
    const lines = [];
    let currentLine = '';

    // 먼저 공백 기준으로 단어 분리
    const words = text.split(' ');

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine) {
            // 현재 줄이 너무 길면
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    // 마지막 줄 추가
    if (currentLine) {
        lines.push(currentLine);
    }

    // 각 줄이 여전히 너무 길면 문자 단위로 분할
    const finalLines = [];
    for (let line of lines) {
        if (ctx.measureText(line).width > maxWidth) {
            // 문자 단위로 분할
            let charLine = '';
            for (let char of line) {
                const testCharLine = charLine + char;
                if (ctx.measureText(testCharLine).width > maxWidth && charLine) {
                    finalLines.push(charLine);
                    charLine = char;
                } else {
                    charLine = testCharLine;
                }
            }
            if (charLine) finalLines.push(charLine);
        } else {
            finalLines.push(line);
        }
    }

    return finalLines;
}
```

##### 4. shareOrDownloadImage() 추가

`wrapKoreanText()` 함수 **바로 다음**에 추가:

```javascript
shareOrDownloadImage(canvas, summaryText) {
    canvas.toBlob((blob) => {
        const file = new File([blob], 'yojeom-eottae-summary.png', { type: 'image/png' });

        // Web Share API 지원 확인
        if (navigator.share) {
            // 파일 공유 가능 여부 확인
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    files: [file],
                    title: '요즘 어때? - 오늘의 한 문장',
                    text: summaryText
                }).then(() => {
                    console.log('공유 성공');
                }).catch((err) => {
                    // 사용자가 공유 취소 시
                    if (err.name !== 'AbortError') {
                        console.log('공유 실패, 다운로드 실행');
                        this.downloadImage(canvas);
                    }
                });
            } else {
                // 파일 공유는 안되지만 텍스트 공유는 가능한 경우
                navigator.share({
                    title: '요즘 어때? - 오늘의 한 문장',
                    text: summaryText
                }).then(() => {
                    console.log('텍스트 공유 성공');
                    alert('💡 이미지는 별도로 다운로드됩니다.');
                    this.downloadImage(canvas);
                }).catch(() => {
                    this.downloadImage(canvas);
                });
            }
        } else {
            // Web Share API 미지원 - 다운로드
            this.downloadImage(canvas);
        }
    }, 'image/png', 0.95); // 품질 95%
}
```

##### 5. downloadImage() 교체

**찾기 (1413줄 근처):**
```javascript
downloadImage(canvas) {
    const link = document.createElement('a');
    link.download = 'daily-summary.png';
    link.href = canvas.toDataURL();
    link.click();
    alert('이미지가 다운로드되었습니다.');
}
```

**교체:**
```javascript
downloadImage(canvas) {
    try {
        const link = document.createElement('a');
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

        link.download = `yojeom-eottae-${dateStr}.png`;
        link.href = canvas.toDataURL('image/png', 0.95);
        link.click();

        alert('✅ 이미지가 다운로드되었습니다.\n다운로드 폴더를 확인해주세요!');
    } catch (err) {
        console.error('다운로드 실패:', err);
        alert('❌ 이미지 다운로드에 실패했습니다.');
    }
}
```

## 🧪 테스트 방법

### 1. 기본 테스트
1. 브라우저에서 index.html 열기
2. 날짜 선택 후 데이터 입력 및 저장
3. "오늘의 한 문장" 모달에서:
   - "📋 문장 복사" 버튼 클릭 → 클립보드 복사 확인
   - "📤 원하면 공유" 버튼 클릭 → 이미지 생성 및 공유/다운로드 확인

### 2. 모바일 테스트
- 모바일 브라우저에서 Web Share API 작동 확인
- 이미지 해상도 확인 (1080x1080)

### 3. PC 테스트
- 데스크톱 브라우저에서 이미지 다운로드 확인
- 생성된 이미지 품질 확인

## 📊 생성되는 이미지 특징

- **크기**: 1080x1080px (인스타그램 최적화)
- **배경**: 그라디언트 (#f8f9fa → #e9ecef)
- **카드**: 흰색 배경 + 그림자 효과
- **텍스트**:
  - 메인: 48px 볼드, 맑은 고딕
  - 서비스명: 28px, 하단 중앙
- **포함 정보**:
  - ✅ 오늘의 한 문장
  - ✅ "요즘 어때?" 로고
  - ❌ 날짜 없음 (개인정보 보호)
  - ❌ 위치 정보 없음

## 🔄 문제 발생 시

### 복구 방법
```bash
# 백업에서 복구
cp index.html.before_share_fix index.html

# 또는 이전 백업에서
cp index.html.backup index.html
```

### 일반적인 문제

#### 1. 한글이 깨져서 표시됨
- 폰트가 제대로 적용되지 않음
- 해결: 브라우저 캐시 초기화 (Ctrl + Shift + Delete)

#### 2. 공유 버튼이 작동하지 않음
- Web Share API 미지원 브라우저
- 해결: 자동으로 다운로드됨 (정상 동작)

#### 3. 이미지가 다운로드되지 않음
- 팝업 차단 설정 확인
- 해결: 팝업 허용 또는 수동 다운로드

## 📌 참고사항

- `improved-share-functions.js` 파일은 참고용입니다
- 실제 적용은 index.html에 직접 수정해야 합니다
- 백업 파일을 반드시 만들어두세요

## 💡 추가 커스터마이징

### 이미지 크기 변경
`generateShareImage()` 함수의:
```javascript
canvas.width = 1080;  // 원하는 너비
canvas.height = 1080; // 원하는 높이
```

### 폰트 크기 변경
```javascript
ctx.font = 'bold 48px ...';  // 숫자 변경
```

### 색상 변경
```javascript
gradient.addColorStop(0, '#your-color-1');
gradient.addColorStop(1, '#your-color-2');
```

## 📮 문의

추가 도움이 필요하면 언제든지 요청해주세요!
