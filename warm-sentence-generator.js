// ============================================================
// 따뜻한 한 문장 생성기
// "요즘 어때?" 서비스용
// ============================================================

/**
 * 기존 generateDailySummary 함수를 대체하는 새로운 함수들
 * index.html의 1062-1121줄을 아래 코드로 교체하면 됩니다.
 */

// 1. 메인 함수: generateDailySummary
generateDailySummary(energy, tags, memo) {
    console.log('🔄 요약 생성 시작 - 에너지:', energy, '태그:', tags, '메모:', memo);

    // 최근 7일 데이터 분석
    const recentContext = this.analyzeRecentDays(7);

    // 오늘 데이터 분석
    const cleanTags = tags.map(tag => tag.replace('#', ''));

    // 문장 생성 컨텍스트 구성
    const context = {
        today: {
            energy: energy,
            tags: cleanTags,
            memo: memo
        },
        recent: recentContext,
        selectedDate: this.selectedDate
    };

    // 따뜻한 한 문장 생성
    const summary = this.generateWarmSentence(context);

    console.log('✅ 요약 생성 완료:', summary);
    return summary;
}

// 2. 최근 며칠 데이터 분석
analyzeRecentDays(days) {
    const today = this.selectedDate;
    const recentRecords = [];
    const energyTrend = [];
    const tagFrequency = {};

    // 오늘을 제외한 최근 며칠 데이터 수집
    for (let i = 1; i <= days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = this.getDateKey(date);

        if (this.data[dateKey]) {
            const record = this.data[dateKey];
            recentRecords.push(record);
            energyTrend.push(record.energy);

            // 태그 빈도 수집
            record.tags.forEach(tag => {
                const cleanTag = tag.replace('#', '');
                tagFrequency[cleanTag] = (tagFrequency[cleanTag] || 0) + 1;
            });
        }
    }

    // 에너지 패턴 분석
    const lowCount = energyTrend.filter(e => e === '낮음').length;
    const highCount = energyTrend.filter(e => e === '높음').length;
    const totalCount = energyTrend.length;

    let energyPattern = 'neutral';
    if (totalCount >= 2) {
        if (lowCount / totalCount > 0.6) energyPattern = 'mostly_low';
        else if (highCount / totalCount > 0.6) energyPattern = 'mostly_high';
        else if (lowCount >= 2) energyPattern = 'some_low';
    }

    // 자주 반복된 태그 찾기
    const frequentTags = Object.entries(tagFrequency)
        .filter(([tag, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag);

    return {
        hasRecentData: recentRecords.length > 0,
        recordCount: recentRecords.length,
        energyPattern: energyPattern,
        frequentTags: frequentTags.slice(0, 3),
        lastEnergy: energyTrend[0] || null
    };
}

// 3. 따뜻한 문장 생성 메인 로직
generateWarmSentence(context) {
    const { today, recent } = context;
    const { energy, tags, memo } = today;

    // 메모 기반 감정 분석
    const sentiment = this.analyzeSentiment(memo);

    // 패턴 선택을 위한 시드 (날짜 기반)
    const seed = this.selectedDate.getDate() + this.selectedDate.getMonth() * 31;

    // 문장 생성 전략 선택
    let sentence = '';

    if (recent.hasRecentData && recent.recordCount >= 2) {
        // 최근 흐름이 있는 경우
        sentence = this.generateContextualSentence(today, recent, sentiment, seed);
    } else {
        // 최근 데이터가 부족한 경우
        sentence = this.generateStandaloneSentence(today, sentiment, seed);
    }

    return sentence;
}

// 4. 감정 분석
analyzeSentiment(memo) {
    if (!memo) return 'neutral';

    const positiveWords = ['좋', '행복', '기쁨', '즐거', '만족', '성공', '잘'];
    const negativeWords = ['힘들', '피곤', '지침', '어려', '아쉬', '실망', '불안', '버거'];
    const neutralWords = ['생각', '고민', '정리', '계획', '준비'];

    const memoLower = memo.toLowerCase();
    const hasPositive = positiveWords.some(word => memoLower.includes(word));
    const hasNegative = negativeWords.some(word => memoLower.includes(word));
    const hasNeutral = neutralWords.some(word => memoLower.includes(word));

    if (hasNegative) return 'difficult';
    if (hasPositive) return 'positive';
    if (hasNeutral) return 'thoughtful';
    return 'neutral';
}

// 5. 맥락 기반 문장 생성 (최근 흐름이 있을 때)
generateContextualSentence(today, recent, sentiment, seed) {
    const { energy, tags } = today;
    const patterns = [];

    // 에너지가 계속 낮았던 경우
    if (recent.energyPattern === 'mostly_low' && energy === '낮음') {
        patterns.push(
            '요즘 계속 힘든 시간이었던 걸 생각하면, 오늘도 쉽지 않았을 것 같아. 그래도 여기까지 온 걸로 충분해.',
            '최근 며칠을 보면, 오늘도 버티는 것 자체가 애쓴 거야.',
            '요즘 흐름 속에서 오늘도 하루를 마무리했다는 것만으로도 괜찮아.'
        );
    } else if (recent.energyPattern === 'mostly_low' && energy !== '낮음') {
        patterns.push(
            '요즘 힘들었던 것 같은데, 오늘은 조금 나아진 것 같아 다행이야.',
            '최근 며칠을 생각하면, 오늘은 조금 숨통이 트인 느낌이야.',
            '요즘 계속 버거웠는데, 오늘은 그래도 괜찮은 하루였던 것 같아.'
        );
    }

    // 에너지가 계속 높았던 경우
    else if (recent.energyPattern === 'mostly_high' && energy === '높음') {
        patterns.push(
            '요즘 계속 바쁘게 달려온 것 같아. 오늘도 열심히 보냈구나.',
            '최근 흐름을 보면, 오늘도 집중해서 하루를 채운 것 같아.',
            '요즘 계속 움직이고 있었는데, 오늘도 그 흐름이 이어진 하루야.'
        );
    } else if (recent.energyPattern === 'mostly_high' && energy === '낮음') {
        patterns.push(
            '요즘 계속 바빴던 걸 생각하면, 오늘은 좀 쉬고 싶었을 것 같아.',
            '최근 계속 달려왔으니, 오늘은 피곤했을 만도 해.',
            '요즘 흐름을 보면, 오늘은 한숨 돌리는 시간이 필요했던 것 같아.'
        );
    }

    // 반복되는 태그가 있는 경우
    else if (recent.frequentTags.length > 0) {
        const repeatedTag = recent.frequentTags[0];
        const todayHasTag = tags.some(t => t === repeatedTag);

        if (todayHasTag) {
            patterns.push(
                `요즘 계속 ${repeatedTag} 중심으로 하루를 보내고 있는 것 같아. 오늘도 그런 하루였구나.`,
                `최근 며칠을 보면, ${repeatedTag}이 계속 너의 주요 관심사였던 것 같아.`,
                `요즘 ${repeatedTag}에 집중하고 있는 것 같아. 오늘도 그 흐름 속에 있었구나.`
            );
        } else {
            patterns.push(
                `요즘은 주로 ${repeatedTag}를 중심으로 보냈는데, 오늘은 조금 다른 하루였던 것 같아.`,
                `최근 흐름과는 조금 다르게, 오늘은 나름의 하루를 보낸 것 같아.`
            );
        }
    }

    // 일반적인 연속성 표현
    else {
        if (sentiment === 'difficult') {
            patterns.push(
                '요즘 흐름 속에서 오늘도 쉽지 않은 하루였던 것 같아. 그래도 여기까지 왔어.',
                '최근 며칠을 보면, 오늘도 너 나름대로 하루를 버텨낸 것 같아.',
                '요즘도 그렇고 오늘도 그렇고, 조용히 애쓰고 있는 것 같아.'
            );
        } else if (sentiment === 'positive') {
            patterns.push(
                '최근 며칠을 보면, 오늘도 괜찮은 하루를 보낸 것 같아.',
                '요즘 흐름 속에서 오늘도 나름대로 의미 있는 시간이었던 것 같아.',
                '큰 말은 없었지만, 요즘도 오늘도 잘 지내고 있는 것 같아.'
            );
        } else {
            patterns.push(
                '큰 말은 없었지만, 요즘 흐름 속에서 오늘도 조용히 애쓴 하루였던 것 같아.',
                '최근 며칠을 보면, 오늘도 너 나름대로 하루를 채운 것 같아.',
                '요즘도 그렇고 오늘도 그렇고, 그냥 하루하루 지나가고 있구나.',
                '최근 흐름 속에서 오늘도 조용히 하루를 마무리했어.'
            );
        }
    }

    // 패턴이 없으면 기본 패턴 추가
    if (patterns.length === 0) {
        patterns.push(
            '최근 며칠을 보면, 오늘도 너 나름대로 하루를 보낸 것 같아.',
            '요즘 흐름 속에서 오늘도 하루를 마무리했구나.'
        );
    }

    // 시드 기반 선택 (같은 날은 같은 문장)
    const index = seed % patterns.length;
    return patterns[index];
}

// 6. 단독 문장 생성 (최근 데이터가 없을 때)
generateStandaloneSentence(today, sentiment, seed) {
    const { energy, tags } = today;
    const patterns = [];

    if (energy === '낮음') {
        if (sentiment === 'difficult') {
            patterns.push(
                '오늘은 쉽지 않은 하루였던 것 같아. 그래도 여기까지 온 걸로 충분해.',
                '힘든 하루를 보냈구나. 그것만으로도 잘한 거야.',
                '버거운 하루였을 것 같아. 고생했어.'
            );
        } else {
            patterns.push(
                '오늘은 조용히 쉬어가는 하루였던 것 같아.',
                '오늘은 에너지를 아끼며 보낸 하루였구나.',
                '피곤한 하루였을 것 같아. 괜찮아.'
            );
        }
    } else if (energy === '높음') {
        patterns.push(
            '오늘은 집중해서 하루를 보낸 것 같아.',
            '활기차게 하루를 채운 것 같아.',
            '오늘은 열심히 움직인 하루였구나.'
        );
    } else {
        if (sentiment === 'difficult') {
            patterns.push(
                '오늘은 나름대로 버텨낸 하루였던 것 같아.',
                '쉽지만은 않았지만, 하루를 마무리했구나.'
            );
        } else {
            patterns.push(
                '오늘도 그냥 하루가 지나갔구나.',
                '오늘은 그렇게 하루를 보냈어.',
                '평범하게 하루를 마무리했구나.'
            );
        }
    }

    const index = seed % patterns.length;
    return patterns[index];
}
