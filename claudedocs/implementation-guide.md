# 구현 가이드 - Confession App 개선사항

**날짜**: 2026-01-10
**버전**: 1.0.0
**상태**: 구현 완료 - 통합 필요

---

## 📋 개요

고해성사 앱에 다음과 같은 핵심 개선사항이 구현되었습니다:

1. ✅ **서비스 레이어 추상화** - 모든 데이터베이스 작업을 중앙화
2. ✅ **포괄적인 에러 처리** - Error Boundary 및 에러 핸들링 유틸리티
3. ✅ **이미지 최적화** - 업로드 전 이미지 압축
4. ✅ **초안 자동 저장** - 작성 중 데이터 손실 방지
5. ✅ **Rate Limiting** - 스팸 방지 및 남용 차단
6. ✅ **의존성 업데이트** - 필요한 패키지 추가

---

## 🚀 빠른 시작

### 1단계: 패키지 설치

```bash
cd ConfessionApp
npm install

# iOS의 경우 추가로
cd ios && pod install && cd ..
```

### 2단계: 새로운 서비스 사용

기존 코드를 새로운 서비스 레이어로 마이그레이션합니다.

#### Before (기존 방식):
```typescript
// 직접 Supabase 호출
const {data, error} = await supabase
  .from('confessions')
  .select('*')
  .eq('device_id', deviceId);

if (error) {
  console.error(error); // 에러 처리 불일치
}
```

#### After (새로운 방식):
```typescript
import {confessionService} from './services/confession.service';
import {getUserFriendlyErrorMessage} from './utils/errorHandler';

const result = await confessionService.getMyConfessions(deviceId);

if (!result.success) {
  // 일관된 에러 처리
  const message = getUserFriendlyErrorMessage(result.error);
  showError(message);
  return;
}

const confessions = result.data.data; // 페이지네이션 포함
```

---

## 📦 새로운 서비스 레이어

### Confession Service (`src/services/confession.service.ts`)

모든 고해성사 관련 작업을 추상화합니다.

#### 주요 메서드:

```typescript
// 모든 고해성사 조회 (페이지네이션)
await confessionService.getAllConfessions(page, limit);

// 특정 고해성사 조회
await confessionService.getConfessionById(id);

// 랜덤 고해성사
await confessionService.getRandomConfession(deviceId);

// 내 고해성사 조회
await confessionService.getMyConfessions(deviceId, page, limit);

// 태그로 필터링
await confessionService.getMyConfessionsByTag(deviceId, tag);

// 고해성사 생성
await confessionService.createConfession({
  content: '고해 내용',
  device_id: deviceId,
  mood: '😊',
  tags: ['일상', '감사'],
  images: ['url1', 'url2']
});

// 고해성사 삭제
await confessionService.deleteConfession(id, deviceId);

// 조회수 증가
await confessionService.incrementViewCount(id);

// 좋아요/싫어요
await confessionService.addLike(confessionId, deviceId, 'like');
await confessionService.getLikeStatus(confessionId, deviceId);
await confessionService.getLikeCounts(confessionId);

// 신고
await confessionService.reportConfession(confessionId, deviceId, 'spam', '설명');

// 조회한 고해성사 목록
await confessionService.getViewedConfessions(deviceId, page, limit);
```

#### 사용 예시:

```typescript
// WriteScreen에서 고해성사 작성
const handleSubmit = async () => {
  const result = await confessionService.createConfession({
    content: confession,
    device_id: deviceId,
    mood: selectedMood,
    tags: selectedTags,
    images: imageUrls,
  });

  if (result.success) {
    showSuccess('고해성사가 작성되었습니다');
    navigation.goBack();
  } else {
    showError(getUserFriendlyErrorMessage(result.error));
  }
};
```

---

### Achievement Service (`src/services/achievement.service.ts`)

업적 시스템 관리를 담당합니다.

#### 주요 메서드:

```typescript
// 사용자 업적 조회
await achievementService.getUserAchievements(deviceId);

// 특정 업적 확인
await achievementService.hasAchievement(deviceId, 'first_post');

// 업적 해제
await achievementService.unlockAchievement(deviceId, 'first_post');

// 미확인 업적 조회
await achievementService.getUnviewedAchievements(deviceId);

// 업적 달성률
await achievementService.getAchievementProgress(deviceId);

// 자동 체크 및 해제
await achievementService.checkAndUnlockFirstPost(deviceId);
await achievementService.checkAndUnlockFirstLike(deviceId);
await achievementService.checkAndUnlockLikeReceived(deviceId);
await achievementService.checkAndUnlock7DayStreak(deviceId);
```

#### 사용 예시:

```typescript
// WriteScreen에서 첫 포스트 업적 체크
const handleSubmit = async () => {
  const result = await confessionService.createConfession(data);

  if (result.success) {
    // 업적 체크
    const achievement = await achievementService.checkAndUnlockFirstPost(deviceId);

    if (achievement.data) {
      showAchievementModal(achievement.data);
    }
  }
};
```

---

### Statistics Service (`src/services/statistics.service.ts`)

통계 데이터 계산 및 조회를 담당합니다.

#### 주요 메서드:

```typescript
// 사용자 전체 통계
await statisticsService.getUserStatistics(deviceId);
// 반환: {totalEntries, currentStreak, longestStreak, totalWords, ...}

// 시간대별 통계
await statisticsService.getTimeBasedStatistics(deviceId);
// 반환: {entriesByHour, entriesByDay, entriesByMonth}

// 일일 통계 (홈 화면용)
await statisticsService.getDailyStatistics(deviceId);
// 반환: {todayCount, totalCount, viewedCount}
```

#### 사용 예시:

```typescript
// ProfileScreen에서 통계 표시
const [stats, setStats] = useState(null);

useEffect(() => {
  loadStats();
}, []);

const loadStats = async () => {
  const result = await statisticsService.getUserStatistics(deviceId);

  if (result.success) {
    setStats(result.data);
  }
};

return (
  <View>
    <Text>총 작성: {stats?.totalEntries}개</Text>
    <Text>현재 연속: {stats?.currentStreak}일</Text>
    <Text>최장 연속: {stats?.longestStreak}일</Text>
  </View>
);
```

---

## 🛡️ 에러 처리

### Error Boundary (`src/components/ErrorBoundary.tsx`)

React 컴포넌트 에러를 캐치하고 사용자 친화적인 fallback UI를 표시합니다.

#### 사용 방법:

```typescript
// App.tsx에 전체 앱을 감싸기
import {ErrorBoundary} from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <FontProvider>
          <NavigationContainer>
            {/* 앱 내용 */}
          </NavigationContainer>
        </FontProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

#### HOC 사용:

```typescript
import {withErrorBoundary} from './components/ErrorBoundary';

const MyScreen = () => {
  // 컴포넌트 내용
};

export default withErrorBoundary(MyScreen);
```

---

### Error Handler Utility (`src/utils/errorHandler.ts`)

에러를 일관되게 처리하고 사용자 친화적 메시지를 제공합니다.

#### 주요 함수:

```typescript
import {
  getUserFriendlyErrorMessage,
  handleAsyncError,
  logError,
  isRetryableError,
  getErrorRecoveryMessage,
} from './utils/errorHandler';

// 사용자 친화적 메시지 가져오기
const message = getUserFriendlyErrorMessage(error);
showError(message);

// 비동기 함수 에러 처리
const data = await handleAsyncError(
  async () => {
    return await someAsyncFunction();
  },
  {
    context: {userId: '123'},
    onError: (message) => showError(message),
  }
);

// 에러 로깅
logError(error, {screen: 'HomeScreen', action: 'loadConfessions'});

// 재시도 가능 여부 확인
if (isRetryableError(error)) {
  // 재시도 로직
}

// 복구 제안 메시지
const recoveryMessage = getErrorRecoveryMessage(error);
```

---

## 🖼️ 이미지 최적화

### Image Optimizer (`src/utils/imageOptimizer.ts`)

업로드 전 이미지를 자동으로 압축합니다.

#### 주요 함수:

```typescript
import {
  compressImage,
  compressImages,
  validateImage,
  validateImages,
  UPLOAD_OPTIONS,
} from './utils/imageOptimizer';

// 단일 이미지 압축
const optimized = await compressImage(image, UPLOAD_OPTIONS);
console.log(`압축 전: ${image.fileSize}, 압축 후: ${optimized.fileSize}`);

// 여러 이미지 압축 (진행률 표시)
const optimizedImages = await compressImages(
  images,
  UPLOAD_OPTIONS,
  (current, total) => {
    console.log(`압축 중: ${current}/${total}`);
  }
);

// 이미지 유효성 검사
const validation = validateImage(image, 10); // 최대 10MB
if (!validation.valid) {
  showError(validation.error);
  return;
}

// 여러 이미지 유효성 검사
const validation = validateImages(images, 5, 10); // 최대 5개, 각 10MB
if (!validation.valid) {
  showError(validation.error);
  return;
}
```

#### ImagePicker 통합 예시:

```typescript
import {launchImageLibrary} from 'react-native-image-picker';
import {compressImages, validateImages, UPLOAD_OPTIONS} from './utils/imageOptimizer';

const handleSelectImages = async () => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 5,
  });

  if (result.assets) {
    // 유효성 검사
    const validation = validateImages(result.assets, 5, 10);
    if (!validation.valid) {
      showError(validation.error);
      return;
    }

    // 압축
    setUploading(true);
    const optimized = await compressImages(
      result.assets,
      UPLOAD_OPTIONS,
      (current, total) => {
        setUploadProgress(`${current}/${total}`);
      }
    );
    setUploading(false);

    // 업로드
    // ... Supabase Storage에 업로드
  }
};
```

---

## 💾 초안 자동 저장

### Draft Manager (`src/utils/draftManager.ts`)

고해성사 작성 중 데이터를 자동으로 저장합니다.

#### 주요 기능:

```typescript
import {draftManager, useDraft} from './utils/draftManager';

// 초안 저장
await draftManager.saveDraft({
  content: '고해 내용',
  mood: '😊',
  tags: ['일상'],
  images: ['url1'],
});

// 초안 불러오기
const draft = await draftManager.loadDraft();
if (draft) {
  setContent(draft.content);
  setMood(draft.mood);
  setTags(draft.tags);
  setImages(draft.images);
}

// 초안 삭제
await draftManager.clearDraft();

// 자동 저장 시작
draftManager.startAutoSave(() => ({
  content: content,
  mood: selectedMood,
  tags: selectedTags,
  images: imageUrls,
}));

// 자동 저장 중지
draftManager.stopAutoSave();
```

#### React Hook 사용:

```typescript
const WriteScreen = () => {
  const {draft, hasDraft, saveDraft, clearDraft} = useDraft();
  const [content, setContent] = useState('');

  // 초안이 있으면 불러오기
  useEffect(() => {
    if (draft) {
      setContent(draft.content);
      // ... 다른 필드 설정
    }
  }, [draft]);

  // 자동 저장 (5초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      if (content.length > 0) {
        saveDraft({content, mood, tags, images});
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [content, mood, tags, images]);

  const handleSubmit = async () => {
    const result = await confessionService.createConfession({...});

    if (result.success) {
      await clearDraft(); // 제출 후 초안 삭제
    }
  };

  return (
    <View>
      {hasDraft && (
        <Text>저장된 초안이 있습니다</Text>
      )}
      {/* ... */}
    </View>
  );
};
```

---

## 🚦 Rate Limiting

### Rate Limiter (`src/utils/rateLimiter.ts`)

스팸 및 남용을 방지합니다.

#### 주요 기능:

```typescript
import {rateLimiter, useRateLimit, DEFAULT_RATE_LIMITS} from './utils/rateLimiter';

// Rate limit 체크
const result = await rateLimiter.check(DEFAULT_RATE_LIMITS.confession_write);

if (!result.allowed) {
  showError(result.message); // "고해성사는 5분에 1개씩만 작성할 수 있습니다."
  return;
}

// 간편 체크
const allowed = await rateLimiter.checkSimple('like_action');
if (!allowed) {
  showError('잠시 후 다시 시도해주세요.');
  return;
}

// 일일 제한 체크
const dailyResult = await rateLimiter.checkDailyLimit('confession_write', 10);
if (!dailyResult.allowed) {
  showError('하루 최대 10개까지만 작성할 수 있습니다.');
  return;
}

// 사용자 친화적 메시지
const message = await rateLimiter.getUserFriendlyMessage('confession_write');
showError(message); // "3분 후에 다시 시도해주세요."
```

#### React Hook 사용:

```typescript
const WriteScreen = () => {
  const {remainingAttempts, remainingTime, checkLimit} = useRateLimit('confession_write');

  const handleSubmit = async () => {
    // Rate limit 체크
    const limitResult = await checkLimit();

    if (!limitResult.allowed) {
      showError(limitResult.message);
      return;
    }

    // 고해성사 작성
    const result = await confessionService.createConfession({...});

    if (result.success) {
      showSuccess('작성되었습니다');
    }
  };

  return (
    <View>
      <Button onPress={handleSubmit} disabled={remainingAttempts === 0}>
        작성하기
      </Button>
      {remainingTime > 0 && (
        <Text>{remainingTime}초 후에 작성할 수 있습니다</Text>
      )}
    </View>
  );
};
```

#### 기본 제한 규칙:

```typescript
{
  confession_write: {
    maxAttempts: 1,
    windowMs: 5 * 60 * 1000, // 5분에 1개
  },
  like_action: {
    maxAttempts: 1,
    windowMs: 10 * 1000, // 10초에 1개
  },
  report_action: {
    maxAttempts: 1,
    windowMs: 60 * 1000, // 1분에 1개
  },
  image_upload: {
    maxAttempts: 5,
    windowMs: 60 * 1000, // 1분에 5개
  },
}
```

---

## 🔧 API 유틸리티

### API Utils (`src/services/api.utils.ts`)

모든 서비스가 공통으로 사용하는 API 유틸리티입니다.

#### 주요 함수:

```typescript
import {apiCall, apiCallWithRetry, calculatePagination} from './services/api.utils';

// 에러 처리가 포함된 API 호출
const result = await apiCall(async () => {
  return await supabase.from('table').select('*');
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error.userMessage);
}

// 재시도 로직이 포함된 API 호출 (네트워크 에러 시 자동 재시도)
const result = await apiCallWithRetry(async () => {
  return await supabase.from('table').select('*');
}, 3, 1000); // 최대 3회, 1초 간격

// 페이지네이션 계산
const {from, to} = calculatePagination(page, limit);
// page=0, limit=20 → from=0, to=19
// page=1, limit=20 → from=20, to=39
```

---

## 📱 실제 적용 예시

### 1. HomeScreen 마이그레이션

#### Before:
```typescript
const HomeScreen = () => {
  const [confession, setConfession] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 랜덤 고해성사
      const {data: confessions} = await supabase
        .from('confessions')
        .select('*')
        .neq('device_id', deviceId)
        .limit(10);

      const random = confessions[Math.floor(Math.random() * confessions.length)];
      setConfession(random);

      // 통계
      const {count: total} = await supabase
        .from('confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', deviceId);

      setStats({total});
    } catch (error) {
      console.error(error); // 불일치한 에러 처리
    }
  };

  // ...
};
```

#### After:
```typescript
import {confessionService} from '../services/confession.service';
import {statisticsService} from '../services/statistics.service';
import {handleAsyncError} from '../utils/errorHandler';

const HomeScreen = () => {
  const [confession, setConfession] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    await handleAsyncError(
      async () => {
        // 랜덤 고해성사
        const confessionResult = await confessionService.getRandomConfession(deviceId);
        if (confessionResult.success) {
          setConfession(confessionResult.data);
        }

        // 일일 통계
        const statsResult = await statisticsService.getDailyStatistics(deviceId);
        if (statsResult.success) {
          setStats(statsResult.data);
        }
      },
      {
        context: {screen: 'HomeScreen'},
        onError: (message) => showError(message),
      }
    );

    setLoading(false);
  };

  // ...
};
```

---

### 2. WriteScreen 마이그레이션

#### Before:
```typescript
const WriteScreen = () => {
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    try {
      const {data, error} = await supabase
        .from('confessions')
        .insert([{content, device_id: deviceId}]);

      if (error) {
        Alert.alert('오류', '작성에 실패했습니다');
        return;
      }

      Alert.alert('완료', '작성되었습니다');
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', '알 수 없는 오류');
    }
  };

  // ...
};
```

#### After:
```typescript
import {confessionService} from '../services/confession.service';
import {achievementService} from '../services/achievement.service';
import {draftManager} from '../utils/draftManager';
import {rateLimiter} from '../utils/rateLimiter';
import {compressImages, validateImages} from '../utils/imageOptimizer';
import {getUserFriendlyErrorMessage} from '../utils/errorHandler';

const WriteScreen = () => {
  const {draft, saveDraft, clearDraft} = useDraft();
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);

  // 초안 불러오기
  useEffect(() => {
    if (draft) {
      setContent(draft.content);
      setMood(draft.mood);
      setTags(draft.tags);
      setImages(draft.images);
    }
  }, [draft]);

  // 자동 저장
  useEffect(() => {
    const interval = setInterval(() => {
      if (content.length > 0) {
        saveDraft({content, mood, tags, images});
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [content, mood, tags, images]);

  const handleSubmit = async () => {
    // 1. Rate limit 체크
    const limitResult = await rateLimiter.check(DEFAULT_RATE_LIMITS.confession_write);
    if (!limitResult.allowed) {
      showError(limitResult.message);
      return;
    }

    // 2. 이미지 유효성 검사 및 압축
    let compressedImages = [];
    if (images.length > 0) {
      const validation = validateImages(images, 5, 10);
      if (!validation.valid) {
        showError(validation.error);
        return;
      }

      compressedImages = await compressImages(images);
    }

    // 3. 고해성사 작성
    const result = await confessionService.createConfession({
      content,
      device_id: deviceId,
      mood,
      tags,
      images: compressedImages.map(img => img.uri),
    });

    if (!result.success) {
      showError(getUserFriendlyErrorMessage(result.error));
      return;
    }

    // 4. 업적 체크
    const achievement = await achievementService.checkAndUnlockFirstPost(deviceId);
    if (achievement.data) {
      showAchievementModal(achievement.data);
    }

    // 5. 초안 삭제
    await clearDraft();

    // 6. 완료
    showSuccess('고해성사가 작성되었습니다');
    navigation.goBack();
  };

  // ...
};
```

---

## 🧪 테스트

### 서비스 테스트 예시

```typescript
// __tests__/services/confession.service.test.ts
import {confessionService} from '../../services/confession.service';

describe('ConfessionService', () => {
  const mockDeviceId = 'test-device-id';

  test('should create confession', async () => {
    const result = await confessionService.createConfession({
      content: 'Test confession',
      device_id: mockDeviceId,
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  test('should reject empty content', async () => {
    const result = await confessionService.createConfession({
      content: '',
      device_id: mockDeviceId,
    });

    expect(result.success).toBe(false);
    expect(result.error?.userMessage).toBe('내용을 입력해주세요.');
  });

  test('should handle pagination', async () => {
    const result = await confessionService.getMyConfessions(mockDeviceId, 0, 10);

    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(0);
    expect(result.data?.limit).toBe(10);
  });
});
```

---

## 📝 다음 단계

### Phase 1 완료 후 (현재):
- ✅ 서비스 레이어 추상화
- ✅ 에러 처리
- ✅ 이미지 최적화
- ✅ 초안 저장
- ✅ Rate limiting

### Phase 2 구현 예정:
- [ ] React Query 통합 (데이터 캐싱)
- [ ] 무한 스크롤 (페이지네이션)
- [ ] 로딩 스켈레톤
- [ ] Sentry 에러 트래킹

### Phase 3 구현 예정:
- [ ] 오프라인 지원
- [ ] 검색 기능
- [ ] 통계 대시보드
- [ ] 온보딩 플로우

---

## 🔗 추가 리소스

- [Service Layer 분석](./service-improvement-analysis.md)
- [API 문서](../docs/api.md)
- [아키텍처 다이어그램](../docs/architecture.md)

---

## ❓ FAQ

### Q: 기존 코드를 모두 마이그레이션해야 하나요?
A: 점진적으로 마이그레이션할 수 있습니다. 새로운 기능부터 서비스 레이어를 사용하고, 기존 코드는 리팩토링 시 변경하세요.

### Q: 에러 처리를 모든 곳에 추가해야 하나요?
A: `handleAsyncError` 함수를 사용하면 간단하게 처리할 수 있습니다. 중요한 작업(작성, 삭제)부터 적용하세요.

### Q: Rate limiting이 너무 엄격하지 않나요?
A: `DEFAULT_RATE_LIMITS`에서 값을 조정할 수 있습니다. 사용자 피드백을 받아 조정하세요.

### Q: 이미지 압축이 느리지 않나요?
A: `react-native-image-resizer`는 네이티브 모듈이라 매우 빠릅니다. 10MB 이미지도 1초 이내에 처리됩니다.

### Q: 초안이 언제 삭제되나요?
A: 24시간 이상 된 초안은 자동 삭제됩니다. 제출 성공 시에도 즉시 삭제됩니다.

---

**작성자**: Claude Sonnet 4.5
**문의**: [GitHub Issues](https://github.com/your-repo/issues)
