---
name: rn-optimize
description: "React Native 성능 최적화 - 렌더링, 메모리, 애니메이션 최적화"
category: optimization
complexity: intermediate
mcp-servers: []
personas: ["performance-engineer"]
---

# /custom:rn-optimize - React Native Performance Optimization

## Triggers
- 앱 성능 저하 발견
- 렌더링 최적화 필요
- 메모리 사용량 증가
- 애니메이션 끊김

## Usage
```
/custom:rn-optimize [target] [--focus render|memory|animation|bundle]
```

## Behavioral Flow
1. **Profile**: 현재 성능 상태 분석
2. **Identify**: 병목 지점 파악
3. **Analyze**: 원인 분석
4. **Optimize**: 최적화 방안 제시
5. **Validate**: 개선 효과 검증

## Tool Coordination
- **Grep**: 성능 안티패턴 검색
- **Read**: 컴포넌트 코드 분석
- **Edit**: 최적화 적용
- **Bash**: 번들 크기 분석

## Analysis Areas

### 1. Render Optimization
**검사 항목:**
- Unnecessary re-renders
- Missing React.memo, useMemo, useCallback
- Inline function/object creation
- Large lists without virtualization
- Conditional rendering patterns

**최적화 기법:**
```typescript
// Before
<FlatList data={items} renderItem={({item}) => <Item {...item} />} />

// After
const renderItem = useCallback(({item}) => <Item {...item} />, []);
<FlatList
  data={items}
  renderItem={renderItem}
  getItemLayout={getItemLayout}
  removeClippedSubviews
/>
```

### 2. Memory Optimization
**검사 항목:**
- Memory leaks in useEffect
- Large image caching
- Unsubscribed listeners
- Retained closures

**최적화 기법:**
```typescript
// Cleanup pattern
useEffect(() => {
  const subscription = source.subscribe();
  return () => subscription.unsubscribe();
}, []);
```

### 3. Animation Optimization
**검사 항목:**
- JS thread blocking animations
- Non-native driver usage
- Complex transform calculations
- Too many animated values

**최적화 기법:**
```typescript
// Use native driver
Animated.timing(value, {
  toValue: 1,
  useNativeDriver: true, // ✅
  duration: 300
}).start();
```

### 4. Bundle Size Optimization
**검사 항목:**
- Unused dependencies
- Large library imports
- Duplicate packages
- Unoptimized images

**분석 명령:**
```bash
# Bundle 분석
npx react-native-bundle-visualizer

# 의존성 크기 확인
npm ls --depth=0
```

## React Native Specific Patterns

### FlatList Best Practices
```typescript
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  getItemLayout={getItemLayout} // 고정 높이일 때
  removeClippedSubviews // Android
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={10}
  initialNumToRender={10}
/>
```

### Image Optimization
```typescript
<Image
  source={{uri: url}}
  resizeMode="cover"
  resizeMethod="resize" // Android
  fadeDuration={0} // Android
/>
```

### Fast Refresh Optimization
```typescript
// 컴포넌트 분리로 Fast Refresh 범위 최소화
// hooks/useData.ts
export const useData = () => { /* ... */ };

// Component.tsx
const Component = () => {
  const data = useData();
  return <View>{/* ... */}</View>;
};
```

## Output Format

**성능 분석 결과**
- 🎯 주요 병목: [설명]
- 📊 영향도: High/Medium/Low
- 💡 예상 개선: [X%]

**최적화 권장사항**
1. **우선순위 높음** (즉시 적용)
   - [ ] 항목 1
   - [ ] 항목 2

2. **우선순위 중간** (단계적 적용)
   - [ ] 항목 1
   - [ ] 항목 2

3. **장기 개선** (리팩토링 필요)
   - [ ] 항목 1
   - [ ] 항목 2

**측정 지표**
- Before: [metrics]
- After: [expected metrics]
- Target: [goal]
