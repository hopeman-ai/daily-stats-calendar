// ============================================================
// 개선된 SNS 공유 기능
// index.html의 copySummaryToClipboard, generateShareImage, downloadImage 함수를 교체
// ============================================================

/**
 * 1. 문장 복사 기능 (클립보드)
 * 기존 함수와 동일하지만 사용자 피드백 개선
 */
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

/**
 * 2. 공유 이미지 생성 (개선 버전)
 * - 한글 줄바꿈 처리 개선
 * - 더 세련된 디자인
 * - 한글 폰트 지원
 */
generateShareImage() {
    const canvas = document.getElementById('share-canvas');
    const ctx = canvas.getContext('2d');
    const summaryText = document.getElementById('summary-text').textContent;

    // 캔버스 크기 설정 (정사각형 - 인스타그램 최적화)
    canvas.width = 1080;
    canvas.height = 1080;

    // 배경 그라디언트
    const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // 메인 카드 영역 (그림자 효과)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(80, 200, 920, 680);

    // 그림자 초기화
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 상단 장식 라인
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(80, 200, 920, 6);

    // 메인 텍스트 렌더링 (한글 줄바꿈 처리)
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 48px "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // 한글 줄바꿈 처리 함수 (개선)
    const lines = this.wrapKoreanText(ctx, summaryText, 820, 48);

    // 텍스트 중앙 정렬을 위한 시작 Y 위치 계산
    const lineHeight = 70;
    const totalTextHeight = lines.length * lineHeight;
    let startY = 540 - (totalTextHeight / 2); // 카드 중앙

    // 각 줄 렌더링
    lines.forEach((line, index) => {
        ctx.fillText(line, 540, startY + (index * lineHeight));
    });

    // 하단 서비스명 (작게)
    ctx.fillStyle = '#95a5a6';
    ctx.font = '28px "Malgun Gothic", "맑은 고딕", sans-serif';
    ctx.fillText('요즘 어때?', 540, 820);

    // 날짜 표시하지 않음 (개인정보 보호)

    // 공유 또는 다운로드 실행
    this.shareOrDownloadImage(canvas, summaryText);
}

/**
 * 3. 한글 텍스트 줄바꿈 처리 (개선)
 * - 문자 단위로 측정하여 정확한 줄바꿈
 * - 공백 우선, 필요시 문자 단위 분할
 */
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

/**
 * 4. 공유 또는 다운로드 실행
 * - Web Share API 지원 시 공유
 * - 미지원 시 다운로드
 */
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

/**
 * 5. 이미지 다운로드
 */
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
