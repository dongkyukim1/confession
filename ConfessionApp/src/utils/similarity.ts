/**
 * 유사도 계산 유틸리티
 *
 * 태그와 내용 기반으로 일기 간 유사도를 계산합니다.
 */

interface ConfessionForMatching {
  id: string;
  content: string;
  mood?: string | null;
  tags?: string[] | null;
}

/**
 * 두 태그 배열 간의 Jaccard 유사도 계산
 * @returns 0~1 사이의 유사도 (1이 완전 일치)
 */
export function calculateTagSimilarity(
  tags1: string[] | null | undefined,
  tags2: string[] | null | undefined,
): number {
  if (!tags1?.length || !tags2?.length) return 0;

  const set1 = new Set(tags1.map(t => t.toLowerCase()));
  const set2 = new Set(tags2.map(t => t.toLowerCase()));

  // 교집합 크기
  const intersection = [...set1].filter(tag => set2.has(tag)).length;
  // 합집합 크기
  const union = new Set([...set1, ...set2]).size;

  return union > 0 ? intersection / union : 0;
}

/**
 * 기분(mood) 일치 점수 계산
 * @returns 0 또는 1
 */
export function calculateMoodSimilarity(
  mood1: string | null | undefined,
  mood2: string | null | undefined,
): number {
  if (!mood1 || !mood2) return 0;
  return mood1 === mood2 ? 1 : 0;
}

/**
 * 간단한 키워드 기반 내용 유사도 계산
 * 한글 형태소 분석 없이 단어 단위로 비교
 */
export function calculateContentSimilarity(
  content1: string,
  content2: string,
): number {
  // 한글, 영문, 숫자만 추출하고 공백으로 분리
  const extractWords = (text: string): Set<string> => {
    const words = text
      .toLowerCase()
      .replace(/[^\uAC00-\uD7A3a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 2); // 2글자 이상만
    return new Set(words);
  };

  const words1 = extractWords(content1);
  const words2 = extractWords(content2);

  if (words1.size === 0 || words2.size === 0) return 0;

  // Jaccard 유사도
  const intersection = [...words1].filter(word => words2.has(word)).length;
  const union = new Set([...words1, ...words2]).size;

  return union > 0 ? intersection / union : 0;
}

/**
 * 종합 유사도 점수 계산
 * 태그 > 기분 > 내용 순으로 가중치 부여
 */
export function calculateOverallSimilarity(
  source: ConfessionForMatching,
  target: ConfessionForMatching,
  weights = {tag: 0.5, mood: 0.2, content: 0.3},
): number {
  const tagScore = calculateTagSimilarity(source.tags, target.tags);
  const moodScore = calculateMoodSimilarity(source.mood, target.mood);
  const contentScore = calculateContentSimilarity(source.content, target.content);

  return (
    tagScore * weights.tag +
    moodScore * weights.mood +
    contentScore * weights.content
  );
}

/**
 * 유사한 일기 찾기 (정렬된 결과 반환)
 */
export function findSimilarConfessions<T extends ConfessionForMatching>(
  source: ConfessionForMatching,
  candidates: T[],
  minScore = 0.1,
): Array<T & {similarityScore: number}> {
  const scored = candidates.map(candidate => ({
    ...candidate,
    similarityScore: calculateOverallSimilarity(source, candidate),
  }));

  return scored
    .filter(item => item.similarityScore >= minScore)
    .sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * 태그 매칭 우선 + 유사도 기반 일기 선택
 *
 * 1순위: 같은 태그가 있는 일기
 * 2순위: 유사도가 높은 일기
 * 3순위: 랜덤 선택
 */
export function selectBestMatch<T extends ConfessionForMatching>(
  source: ConfessionForMatching,
  candidates: T[],
): T | null {
  if (candidates.length === 0) return null;

  // 1순위: 태그 매칭 (적어도 하나의 태그가 일치하는 경우)
  if (source.tags && source.tags.length > 0) {
    const tagMatchedCandidates = candidates.filter(candidate => {
      if (!candidate.tags || candidate.tags.length === 0) return false;
      const sourceTags = new Set(source.tags!.map(t => t.toLowerCase()));
      return candidate.tags.some(t => sourceTags.has(t.toLowerCase()));
    });

    if (tagMatchedCandidates.length > 0) {
      // 태그 매칭된 것들 중 유사도가 높은 순으로 정렬
      const sorted = findSimilarConfessions(source, tagMatchedCandidates);
      if (sorted.length > 0) {
        // 상위 3개 중 랜덤 선택 (다양성 확보)
        const topCandidates = sorted.slice(0, Math.min(3, sorted.length));
        const randomIndex = Math.floor(Math.random() * topCandidates.length);
        return topCandidates[randomIndex];
      }
    }
  }

  // 2순위: 유사도 기반 선택
  const similarCandidates = findSimilarConfessions(source, candidates, 0.05);
  if (similarCandidates.length > 0) {
    // 상위 5개 중 랜덤 선택
    const topCandidates = similarCandidates.slice(0, Math.min(5, similarCandidates.length));
    const randomIndex = Math.floor(Math.random() * topCandidates.length);
    return topCandidates[randomIndex];
  }

  // 3순위: 완전 랜덤 선택
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}
