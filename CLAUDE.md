# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
이 파일은 이 저장소에서 코드 작업을 할 때 Claude Code (claude.ai/code)에 대한 가이드를 제공합니다.

## Project Overview / 프로젝트 개요

This is a web-based game collection built with React, TypeScript, and Vite. The project features multiple mini-games with a unified difficulty system and scoring mechanism.

React, TypeScript, Vite로 구축된 웹 기반 게임 컬렉션입니다. 이 프로젝트는 통합된 난이도 시스템과 점수 메커니즘을 갖춘 여러 미니 게임을 특징으로 합니다.

## Development Commands / 개발 명령어

```bash
# Install dependencies / 의존성 설치
npm install

# Run development server / 개발 서버 실행
npm run dev

# Build for production / 프로덕션 빌드
npm run build

# Lint code / 코드 린트
npm run lint

# Preview production build / 프로덕션 빌드 미리보기
npm run preview
```

## Architecture / 아키텍처

### Core Technologies / 핵심 기술
- **Frontend Framework / 프론트엔드 프레임워크**: React 19 with TypeScript
- **Build Tool / 빌드 도구**: Vite 5
- **Routing / 라우팅**: React Router DOM 7
- **Styling / 스타일링**: CSS modules with component-specific stylesheets / 컴포넌트별 스타일시트를 사용하는 CSS 모듈

### Project Structure / 프로젝트 구조

The application follows a component-based architecture with the following key patterns:
애플리케이션은 다음과 같은 주요 패턴을 가진 컴포넌트 기반 아키텍처를 따릅니다:

1. **Game Container Pattern / 게임 컨테이너 패턴**: All games are wrapped in a `GameContainer` component that provides:
   모든 게임은 다음을 제공하는 `GameContainer` 컴포넌트로 래핑됩니다:
   - Difficulty selector / 난이도 선택기
   - Navigation back to home / 홈으로 돌아가는 네비게이션
   - Consistent layout and styling / 일관된 레이아웃과 스타일링
   - Game state injection via React Context / React Context를 통한 게임 상태 주입

2. **Context-Based State Management / Context 기반 상태 관리**: The `GameContext` provides centralized game state management including:
   `GameContext`는 다음을 포함한 중앙집중식 게임 상태 관리를 제공합니다:
   - Score tracking / 점수 추적
   - Level progression / 레벨 진행
   - Play/pause state / 재생/일시정지 상태
   - Difficulty settings / 난이도 설정

3. **Type-Safe Game Interfaces / 타입 안전 게임 인터페이스**: All games implement consistent interfaces defined in `src/types/game.ts`:
   모든 게임은 `src/types/game.ts`에 정의된 일관된 인터페이스를 구현합니다:
   - `Game`: Metadata for game listings / 게임 목록을 위한 메타데이터
   - `GameState`: Runtime state management / 런타임 상태 관리
   - `Difficulty`: Standardized difficulty levels / 표준화된 난이도 레벨
   - `GameResult`: Score tracking structure / 점수 추적 구조

### Routing Structure / 라우팅 구조

```
/ - Home page with game listings / 게임 목록이 있는 홈 페이지
/game/number-guessing - Number guessing game / 숫자 맞추기 게임
/game/memory-cards - Memory card matching game / 메모리 카드 매칭 게임
/game/snake - Snake game / 스네이크 게임
```

### Game Implementation Pattern / 게임 구현 패턴

Each game component: / 각 게임 컴포넌트는:
1. Accepts an optional `difficulty` prop injected by `GameContainer`
   `GameContainer`에 의해 주입된 선택적 `difficulty` prop을 받습니다
2. Uses the `useGame` hook to access shared game state
   공유 게임 상태에 접근하기 위해 `useGame` 훅을 사용합니다
3. Implements game-specific logic while maintaining consistent scoring and level progression
   일관된 점수 산정 및 레벨 진행을 유지하면서 게임별 로직을 구현합니다
4. Includes its own CSS file for styling
   스타일링을 위한 자체 CSS 파일을 포함합니다

### Key Design Decisions / 주요 설계 결정사항

- **Component Isolation / 컴포넌트 격리**: Each game is self-contained with its own logic and styling / 각 게임은 자체 로직과 스타일링으로 독립적입니다
- **Shared State / 공유 상태**: Common game functionality (scoring, levels) is managed centrally / 공통 게임 기능(점수, 레벨)은 중앙에서 관리됩니다
- **Type Safety / 타입 안전성**: TypeScript interfaces ensure consistent data structures across games / TypeScript 인터페이스는 게임 전반에 걸쳐 일관된 데이터 구조를 보장합니다
- **Responsive Design / 반응형 디자인**: CSS includes media queries for mobile support / CSS는 모바일 지원을 위한 미디어 쿼리를 포함합니다

When adding new games: / 새 게임 추가 시:
1. Create a new component in `src/games/` / `src/games/`에 새 컴포넌트를 생성합니다
2. Add routing in `App.tsx` / `App.tsx`에 라우팅을 추가합니다
3. Update the games array in `Home.tsx` / `Home.tsx`의 games 배열을 업데이트합니다
4. Ensure the game uses the `useGame` hook for state management / 게임이 상태 관리를 위해 `useGame` 훅을 사용하는지 확인합니다
5. Follow the existing difficulty scaling patterns / 기존 난이도 스케일링 패턴을 따릅니다