---
name: commit
description: "Git 커밋 생성 - 변경사항 분석 후 의미있는 커밋 메시지 작성"
category: utility
complexity: basic
mcp-servers: []
personas: []
---

# /custom:commit - Smart Git Commit

## Triggers
- 코드 변경 후 커밋 생성
- 작업 완료 시점
- 체크포인트 저장

## Usage
```
/custom:commit [-m "custom message"] [--amend]
```

## Behavioral Flow
1. **Status Check**: git status로 변경사항 확인
2. **Diff Analysis**: 변경 내용 분석
3. **Message Generation**: 적절한 커밋 메시지 생성
4. **Validation**: 커밋 전 검증
5. **Commit**: 커밋 실행
6. **Confirmation**: 결과 확인

## Tool Coordination
- **Bash**: git 명령 실행
- **Read**: 변경된 파일 내용 확인

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Types
- **feat**: 새로운 기능
- **fix**: 버그 수정
- **refactor**: 리팩토링
- **style**: 스타일 변경
- **docs**: 문서 수정
- **test**: 테스트 추가
- **chore**: 빌드/설정 변경
- **perf**: 성능 개선

### Scope (ConfessionApp 기준)
- **components**: UI 컴포넌트
- **screens**: 화면
- **utils**: 유틸리티
- **hooks**: 커스텀 훅
- **theme**: 테마/스타일
- **contexts**: Context API
- **features**: 기능 모듈

## Validation Checks
- 🔍 변경사항이 있는지 확인
- 🛡️ 민감정보(.env 등) 포함 여부
- 📝 의미있는 변경인지 검증
- ✅ 관련 파일들이 함께 커밋되는지 확인

## Examples

**기능 추가**
```
feat(components): add achievement modal with animation

- Implement LottieAnimation for celebration effect
- Add haptic feedback on achievement unlock
- Integrate with achievement manager
```

**버그 수정**
```
fix(hooks): resolve achievement checker race condition

- Add proper dependency array to useEffect
- Prevent duplicate achievement triggers
```

**리팩토링**
```
refactor(theme): extract common shadow styles

- Create reusable shadow utility
- Update components to use shadow helpers
- Improve consistency across app
```
