# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Volleyball scheduling web app with:
- **VBALL.Identity** — ASP.NET Core 8 microservice for auth (JWT + refresh tokens via HTTP-only cookies)
- **VBALL.Schedule** — ASP.NET Core 8 microservice for match/team/participation management
- **VBALL.Notifications** — Spring Boot service (HTTP :8080, gRPC :9090)
- **VBALL.Client** — React 19 SPA (Create React App, TypeScript, Tailwind, MobX)
- **VBALL.Mobile** — Expo/React Native app (file-based routing via expo-router)
- **nginx** — Reverse proxy routing `/identity/`, `/schedule/`, `/api/`, and `/` (static client)

## Commands

### React Client (`VBALL.Client/`)
```bash
npm start          # dev server (port 3000)
npm test           # run tests (Jest/RTL)
npm run build      # production build
```

### Mobile (`VBALL.Mobile/`)
```bash
npx expo start     # start dev server
npx expo start --android
npx expo start --ios
expo lint
```

### .NET Backend (from service directory, e.g. `VBALL.Schedule/`)
```bash
dotnet run --project Schedule.Presentation          # run API
dotnet test Schedule.IntegrationTests               # run tests (uses Testcontainers+PostgreSQL)
dotnet test Identity.Tests                          # run Identity tests
dotnet ef migrations add <Name> --project Schedule.Infrastructure --startup-project Schedule.Presentation
```

### Docker (full stack)
```bash
docker-compose up -d                                # start all services
docker-compose --profile build up client-build     # build & publish React static files
docker-compose --profile build up --build client-build && docker-compose restart nginx  # rebuild client
```

## Architecture

### .NET Services (Clean Architecture, 4 layers each)

Both Identity and Schedule follow the same layer structure:
- **Domain** — entities, repository interfaces, service interfaces, Specification pattern
- **Application** — MediatR CQRS (commands/queries + handlers), FluentValidation, AutoMapper, pipeline behaviors
- **Infrastructure** — EF Core + PostgreSQL, repository implementations, service implementations
- **Presentation** — ASP.NET controllers, DI wiring, middleware

MediatR pipeline behaviors (Schedule only): `ValidationBehavior` → `MatchExistenceValidationBehavior` → `TeamExistenceValidationBehavior` → `FinishedMatchValidationBehavior` → handler.

### Schedule Domain Model

- **Match**: `MatchId`, `StartTime`, `TeamAId`, `TeamBId`, `Status` (Scheduled/InProgress/Finished), `FinalScore`
- **Participation**: `ParticipationId`, `MatchId`, `PlayerId`, `TeamId`, `Status`, `CancellationReason`, `CancellationType`
- **ParticipationStatus** state machine: `Applied → Reviewed → Registered/Waitlisted → Confirmed → PendingCancellation → Cancelled`
  - Cancellation is two-step: player requests (`PendingCancellation`), admin approves or rejects

### React Client

- **State**: MobX stores via `RootStore` → `AuthStore` + `ScheduleStore`, provided via `StoreProvider` context; access with `useAuthStore()` / `useScheduleStore()`
- **HTTP**: Three axios instances in `services/httpClient.ts` — `identityApiClient` (:5000), `scheduleApiClient` (:5054), `notificationsApiClient` (:8080). Both identity/schedule clients share a single token-refresh queue (automatic 401 retry).
- **Auth**: JWT stored in `localStorage` (`vball_access_token`); refresh token via HTTP-only cookie. JWT claims: `uid` (user id), `email`, `adm` (`"1"` = Admin).
- **Routing**: React Router v6; default redirect `/` → `/calendar`; routes: `/calendar`, `/matches/:matchId`, `/admin`, `/admin/teams`

### Mobile App (VBALL.Mobile)

Expo Router file-based routing:
- `app/(auth)/` — login, register (unauthenticated)
- `app/(app)/(tabs)/` — main tabs: index, profile, notifications, admin
- `app/(app)/match/[id].tsx` — match detail
- `app/(app)/admin/` — admin screens

Shares the same MobX store pattern (`RootStore`, `AuthStore`) and service layer structure as the web client.

### API Base URLs (dev)

| Service | Local | Docker (nginx) |
|---|---|---|
| Identity | `http://localhost:5000` | `/identity/` |
| Schedule | `http://localhost:5054` | `/schedule/` and `/api/` |
| Notifications | `http://localhost:8080` | — |

### Database

Both services use PostgreSQL. EF Core migrations are applied automatically on startup (`ApplyDatabaseMigrationAsync`). Integration tests use Testcontainers to spin up a real PostgreSQL container.
- Identity DB: `identity_db`
- Schedule DB: `schedule_db`
- Default credentials (dev/docker): `postgres21` / `123`
