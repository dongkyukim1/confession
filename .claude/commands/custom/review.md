---
name: review
description: "코드 리뷰 수행 - 품질, 보안, 성능, 테스트 커버리지 분석"
category: utility
complexity: basic
mcp-servers: []
personas: []
---

# /custom:review - 코드 리뷰

## Triggers
- 코드 변경사항 리뷰 요청
- Pull Request 검토
- 코드 품질 검증

## Usage
```
/custom:review [--focus quality|security|performance|all]
```

## Behavioral Flow
1. **Git Status**: 현재 변경사항 확인
2. **Diff Analysis**: 변경된 코드 분석
3. **Quality Check**: 코드 품질 평가
4. **Security Scan**: 보안 이슈 검토
5. **Performance Review**: 성능 영향 분석
6. **Report**: 종합 리뷰 결과 제공

## Tool Coordination
- **Bash**: git status, git diff 실행
- **Read**: 변경된 파일 내용 확인
- **Grep**: 패턴 기반 이슈 검색

## Analysis Criteria

### Code Quality
- 가독성 및 유지보수성
- DRY, SOLID 원칙 준수
- 네이밍 컨벤션
- 코드 복잡도

### Security
- Input validation
- XSS, SQL Injection 취약점
- 민감 정보 노출
- 인증/인가 로직

### Performance
- 불필요한 re-render (React Native)
- 메모리 누수 가능성
- 비효율적인 알고리즘
- 네트워크 최적화

### Testing
- 테스트 커버리지
- Edge case 처리
- 에러 핸들링

## Output Format

**변경사항 요약**
- 파일 수: X개
- 추가: +XXX줄
- 삭제: -XXX줄

**품질 평가**
- ✅ 좋은 점
- ⚠️ 개선 필요
- 🚨 즉시 수정 필요

**권장사항**
1. 우선순위 높음
2. 우선순위 중간
3. 개선 제안
