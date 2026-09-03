# Matdori Market

Matdori Market은 레시피를 주제로 만드는 팀 프로젝트입니다. 프론트엔드와 백엔드를 하나의 저장소에서 관리하는 npm workspaces 기반 모노레포로 구성되어 있습니다.

이 README는 팀원이 프로젝트를 처음 내려받았을 때 개발 환경을 빠르게 준비할 수 있도록 정리한 온보딩 문서입니다. 로컬 실행 방법, 환경 변수, 주요 명령어, 폴더 구조와 협업 규칙을 한곳에서 확인할 수 있습니다.

## 기술 스택

| 영역               | 기술                           |
| ------------------ | ------------------------------ |
| Frontend           | Next.js 16, React 19           |
| Backend            | Express                        |
| Database           | PostgreSQL                     |
| ORM                | Prisma 7                       |
| Code Quality       | ESLint, Prettier               |
| Git Hooks          | Husky, lint-staged, Commitlint |
| Package Management | npm workspaces                 |
| CI                 | GitHub Actions                 |

## 시작하기

프로젝트를 처음 실행할 때는 아래 순서대로 진행합니다. 모든 npm 명령어는 별도 안내가 없다면 프로젝트 루트에서 실행합니다.

### 요구 사항

- Node.js 24
- npm 11 이상
- PostgreSQL
- Git

Node.js 버전은 `.nvmrc`를 기준으로 맞춥니다. nvm을 사용한다면 아래 명령어를 실행합니다.

```bash
nvm install
nvm use
```

### 설치

```bash
git clone https://github.com/fs14-favorite-photo-team2/14-matdori-team2.git
cd 14-matdori-team2
npm install
```

루트의 `npm install` 한 번으로 프론트엔드와 백엔드 의존성이 모두 설치됩니다.

### 환경 변수 설정

백엔드와 프론트엔드의 예시 파일을 복사해 로컬 환경 변수 파일을 만듭니다.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Windows PowerShell에서는 다음 명령어를 사용합니다.

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
```

생성한 `apps/api/.env`의 `DATABASE_URL`을 각자의 로컬 PostgreSQL 환경에 맞게 수정합니다. `apps/web/.env.local`의 `NEXT_PUBLIC_API_URL`은 브라우저에서 요청할 Express 서버 주소입니다. `NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저에 공개되므로 비밀값을 넣지 않습니다. 실제 환경 변수 파일은 커밋하지 않습니다.

| 이름                  | 기본값/예시                       | 설명                            |
| --------------------- | --------------------------------- | ------------------------------- |
| `PORT`                | `3001`                            | Express 서버 포트               |
| `NODE_ENV`            | `development`                     | 실행 환경 (`production` 등)     |
| `CLIENT_ORIGIN`       | `http://localhost:3000`           | CORS에서 허용할 프론트엔드 주소 |
| `DATABASE_URL`        | `postgresql://.../matdori_market` | PostgreSQL 연결 문자열          |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api`       | 프론트엔드에서 사용할 API 주소  |

`npm run build`와 Prisma 명령어는 API의 Prisma 설정을 불러오므로 먼저 `apps/api/.env`를 만들어야 합니다. Prisma Client 생성 자체는 데이터베이스에 연결하지 않으므로 PostgreSQL을 실행하지 않은 상태에서도 예시 URL을 사용할 수 있습니다.

### 데이터베이스 준비

먼저 Prisma Client를 생성합니다.

```bash
npm run prisma:generate
```

첫 모델을 정의한 뒤 아래 명령어로 마이그레이션을 생성하고 로컬 데이터베이스에 적용합니다.

```bash
npm run prisma:migrate
```

데이터를 직접 확인하려면 Prisma Studio를 실행합니다.

```bash
npm run prisma:studio
```

### 로컬 실행

프론트엔드와 백엔드를 함께 실행합니다.

```bash
npm run dev
```

한쪽 앱만 실행하려면 다음 명령어를 사용합니다.

```bash
npm run dev:web
npm run dev:api
```

| 서버         | 주소                           |
| ------------ | ------------------------------ |
| Frontend     | `http://localhost:3000`        |
| Backend      | `http://localhost:3001`        |
| Health Check | `http://localhost:3001/health` |
| Ready Check  | `http://localhost:3001/ready`  |
| API Docs     | `http://localhost:3001/docs`   |

`/health`는 서버 프로세스의 생존 여부를 확인하고, `/ready`는 데이터베이스 연결을 포함한 요청 처리 준비 여부를 확인합니다. API 문서는 개발 환경에서만 제공되며, `NODE_ENV=production`에서는 `/docs` 경로가 등록되지 않습니다. API 명세는 프로젝트 루트의 `openapi.yaml`에서 관리합니다.

## 주요 명령어

| 명령어                    | 설명                           |
| ------------------------- | ------------------------------ |
| `npm run dev`             | 프론트엔드와 백엔드 동시 실행  |
| `npm run dev:web`         | Next.js 개발 서버만 실행       |
| `npm run dev:api`         | Express 개발 서버만 실행       |
| `npm run build`           | 모든 workspace 빌드            |
| `npm run lint`            | 모든 workspace의 ESLint 검사   |
| `npm run lint:fix`        | ESLint 오류 자동 수정          |
| `npm run format`          | Prettier로 전체 파일 포맷팅    |
| `npm run format:check`    | 파일을 수정하지 않고 포맷 검사 |
| `npm run prisma:generate` | Prisma Client 생성             |
| `npm run prisma:migrate`  | 로컬 마이그레이션 생성 및 적용 |
| `npm run prisma:studio`   | Prisma Studio 실행             |

## 폴더 구조

```text
14-matdori-team2/
  apps/
    web/                              # Next.js 프론트엔드
      public/                         # 정적 파일
      src/
        app/                          # App Router 페이지와 전역 레이아웃
          layout.jsx
          globals.css
          page.jsx                    # 홈
          login/page.jsx
          signup/page.jsx
          marketplace/
            page.jsx                  # 마켓플레이스 목록
            [listingId]/
              page.jsx                # 판매 항목 상세
              purchase/success/page.jsx
              exchange/success/page.jsx
          my-kitchen/
            page.jsx                  # 마이키친 목록
            create/
              page.jsx                # 레시피 생성
              success/page.jsx
          my-sales/
            page.jsx                  # 내 판매 목록
            register/success/page.jsx
        components/
          common/                     # 공통 UI 컴포넌트
            Button/
            Input/
            Textarea/
            Select/
            Modal/
            RecipeCard/
            SearchBar/
            Pagination/
            Toast/
          layout/                     # 레이아웃 전용 컴포넌트
            Header/
            ProfileMenu/
            MobileMenu/
            NotificationModal/
        features/                     # 도메인별 기능 모듈
          auth/
          marketplace/
          my-kitchen/
          sales/
          random-point/
          notifications/
        lib/                          # 라이브러리 설정 및 클라이언트
        hooks/                        # 공통 React 훅
        constants/                    # 공통 상수
        utils/                        # 공통 유틸리티 함수
      .env.example                    # 프론트엔드 환경 변수 예시
    api/                    # Express 백엔드
      prisma/
        schema.prisma       # Prisma 데이터 모델
      src/
        app.js              # Express 앱과 미들웨어 설정
        server.js           # API 서버 실행 진입점
        generated/          # 생성된 Prisma Client
      .env.example          # 백엔드 환경 변수 예시
  .github/
    workflows/ci.yml        # PR 및 push 품질 검사
    pull_request_template.md
    CODEOWNERS
  .husky/
    pre-commit              # staged 파일 검사
    commit-msg              # 커밋 메시지 검사
  package.json              # 공통 스크립트와 workspace 설정
  package-lock.json         # 저장소 공통 lockfile
```

## 브랜치 전략

팀 개발은 `develop`을 중심으로 진행합니다. 작업 브랜치는 최신 `develop`에서 만들고, PR과 리뷰를 거쳐 반영합니다. 배포할 준비가 된 변경만 `main`에 병합합니다.

| 브랜치    | 용도                         |
| --------- | ---------------------------- |
| `main`    | 프로덕션 배포                |
| `develop` | 팀 개발 통합                 |
| `feat/*`  | 기능 개발                    |
| `fix/*`   | 버그 수정                    |
| `chore/*` | 설정, 패키지, 기타 정리 작업 |
| `docs/*`  | 문서 작업                    |

## Pull Request 규칙

- `main`과 `develop`에 직접 push하지 않습니다.
- PR 제목도 Conventional Commits 형식으로 작성합니다.
- 변경 사항과 테스트 방법을 PR 템플릿에 적습니다.
- UI 변경이 있다면 스크린샷을 첨부합니다.
- 환경 변수가 추가되거나 변경되면 `.env.example`과 README를 함께 수정합니다.
- PR을 올리기 전에 아래 검사를 실행합니다.

```bash
npm run format:check
npm run lint
npm run build
```

## 커밋 메시지 규칙

Commitlint가 커밋 메시지를 검사하므로 Conventional Commits 형식을 사용합니다.

```text
type: short description
```

예시:

```text
feat: add recipe card
fix: handle missing image url
docs: update local setup guide
chore: configure eslint and prettier
```

Husky는 커밋 시 다음 검사를 자동으로 실행합니다.

| Hook         | 실행 내용                                      |
| ------------ | ---------------------------------------------- |
| `pre-commit` | lint-staged로 커밋 대상 파일 검사 및 자동 수정 |
| `commit-msg` | Commitlint로 커밋 메시지 형식 검사             |

## CI

GitHub Actions는 `main`과 `develop`의 PR 및 push에서 PR 제목, 포맷, ESLint, Prisma 스키마와 전체 빌드를 검사합니다. CI를 통과한 뒤 병합합니다.
