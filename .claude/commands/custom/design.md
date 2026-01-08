오케이 👍
**바로 복붙해서 쓸 수 있는 `.md` 파일 형태**로 깔끔하게 정리해서 줄게.
(설명 X, 메타 X, 그냥 “커스텀 Claude Code Skills 문서”)

---

```md
---
name: tinder-ui-refactor
description: "Tinder 앱 디자인을 레퍼런스로 카드 기반 UI, 인터랙션, 컬러 시스템을 적용하는 UI/UX 리팩토링 스킬"
category: design
complexity: intermediate
mcp-servers: []
personas: ["ui-ux-designer", "frontend-engineer"]
---

# /custom:tinder-ui-refactor – Tinder Inspired App Design Skill

## Triggers
- UI가 올드해 보일 때
- 사용자 체류 시간이 낮을 때
- 카드 기반 UX가 필요한 서비스
- 모바일 친화적인 디자인 개선 필요

---

## Usage
```

/custom:tinder-ui-refactor [target-screen] [--focus layout|interaction|color|motion|component]

```

예시:
```

/custom:tinder-ui-refactor home --focus interaction

````

---

## Behavioral Flow

1. **Reference Scan**
   - Tinder 앱 핵심 UI/UX 패턴 분석
2. **UI Diagnosis**
   - 현재 화면 구조, 행동 흐름 문제점 도출
3. **Pattern Mapping**
   - Tinder UX 패턴을 기존 앱 구조에 매핑
4. **Redesign**
   - 컴포넌트 단위 리팩토링 제안
5. **Validate UX**
   - 사용성 및 전환율 개선 여부 검증

---

## Tinder Design Core Patterns

### 1. Layout Optimization (Card-Based)

**검사 항목**
- 한 화면에 하나의 핵심 콘텐츠만 존재하는가
- 스크롤보다 제스처 중심 구조인가
- CTA가 명확한가

```tsx
<View style={styles.deck}>
  <Animated.View style={styles.card}>
    <CardContent />
  </Animated.View>
</View>
````

---

### 2. Interaction Optimization (Swipe UX)

**검사 항목**

* 주요 행동이 버튼이 아닌 제스처인가
* 스와이프 방향에 의미가 명확한가
* 실수 방지 UX가 존재하는가

```ts
PanResponder.create({
  onPanResponderMove: Animated.event(
    [null, { dx: pan.x, dy: pan.y }],
    { useNativeDriver: false }
  ),
});
```

---

### 3. Color System Refactor

**검사 항목**

* 액션별 색상 의미가 명확한가
* Primary / Secondary 컬러가 구분되는가
* 중립 색상이 충분히 절제되어 있는가

```ts
const colors = {
  primary: "#FD5068",
  positive: "#21D07C",
  negative: "#E94E4E",
  background: "#FFFFFF",
};
```

---

### 4. Motion & Feedback

**검사 항목**

* 애니메이션이 행동 결과를 설명하는가
* 과한 모션으로 UX를 방해하지 않는가
* 즉각적인 피드백이 존재하는가

```ts
Animated.spring(position, {
  toValue: { x: 500, y: 0 },
  useNativeDriver: true,
}).start();
```

---

### 5. Component Structure Refactor

**Before**

```tsx
<ScrollView>
  {items.map(item => (
    <ItemCard key={item.id} {...item} />
  ))}
</ScrollView>
```

**After**

```tsx
<SwipeDeck
  data={items}
  renderCard={ItemCard}
  onSwipeRight={onPositive}
  onSwipeLeft={onNegative}
/>
```

---

## Output Format

### 🎨 UI/UX 분석 결과

* 대상 화면: [Screen Name]
* 주요 문제점: [설명]
* Tinder 패턴 적합도: High / Medium / Low

---

### ✨ 리팩토링 권장 사항

#### 1. 우선순위 높음 (즉시 적용)

* [ ] 카드 기반 레이아웃 전환
* [ ] 스와이프 제스처 도입
* [ ] Primary Action 컬러 통합

#### 2. 우선순위 중간 (몰입도 개선)

* [ ] 마이크로 인터랙션 추가
* [ ] 버튼 → 제스처 중심 UX 전환
* [ ] 햅틱 피드백 연동

#### 3. 장기 개선 (고도화)

* [ ] 사용자 행동 기반 애니메이션 분기
* [ ] 개인화 카드 UI
* [ ] A/B 테스트 구조 설계

---

## UX 개선 기대 지표

* 체류 시간: +30~50%
* 주요 액션 전환율: +20% 이상
* 사용자 학습 비용: 감소

---

```
