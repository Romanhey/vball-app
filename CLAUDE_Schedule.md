# CLAUDE.md — VBALL.Schedule

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Service Does

ASP.NET Core 8 microservice managing the volleyball schedule: matches, teams, and player participation. Validates JWT tokens issued by the Identity service (shared secret). Sends notifications to the Notifications service via gRPC.

## Ports & Paths

- Dev: `http://localhost:5054`
- Docker/nginx: `/schedule/` and `/api/` (backward-compat alias)

## Layer Structure

```
Schedule.Domain/           — entities, enums, repository interfaces, domain service interfaces, Specification pattern
Schedule.Application/      — MediatR CQRS, FluentValidation, AutoMapper, pipeline behaviors
Schedule.Infrastructure/   — EF Core + PostgreSQL, repositories, gRPC notification client, migrations
Schedule.Presentation/     — controllers, ExceptionHandlerMiddleware, Program.cs
Schedule.IntegrationTests/ — xUnit + Testcontainers (real PostgreSQL)
Schedule.Share/            — (shared models/DTOs if any)
```

## Domain Model

**Match**
- `MatchId`, `StartTime` (DateTime), `TeamAId`, `TeamBId`, `Status` (MatchStatus enum), `FinalScore?`
- `MatchStatus`: `Scheduled`, `InProgress`, `Finished`

**Team**
- `TeamId`, `Name`, `Rating` (double)

**Participation**
- `ParticipationId`, `MatchId`, `PlayerId` (int, references Identity user), `TeamId?`, `CreatedAt`, `UpdatedAt?`, `Status` (ParticipationStatus), `CancellationReason?`, `CancellationType?`
- `ParticipationStatus`: `Applied → Reviewed → Registered / Waitlisted → Confirmed → PendingCancellation → Cancelled`
- `CancellationType`: `PlayerRequest`, `AdminDecision`, `NoConfirmation`, `Emergency`

## Participation State Machine (Full)

```
Applied        → Reviewed (admin: review), Cancelled
Reviewed       → Registered, Waitlisted (admin: approve), Cancelled
Waitlisted     → Registered (admin: review-waitlisted), Cancelled
Registered     → Confirmed (admin: confirm + assign teamId), PendingCancellation (player), Cancelled
Confirmed      → PendingCancellation (player: request-cancellation), Cancelled (admin: admin-cancel)
PendingCancellation → Cancelled (admin: approve-cancellation), Confirmed/Registered (admin: reject-cancellation)
Cancelled      → [final state]
```

## API Endpoints

All controllers are at `/api/[controller]`. JWT Bearer auth required where noted.

**MatchController**
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/Match` | Admin | Create match |
| GET | `/api/Match/{id}` | — | Get by id |
| PUT | `/api/Match/{id}` | Admin | Update |
| PUT | `/api/Match/{id}/start` | Admin | Set InProgress |
| PUT | `/api/Match/{id}/finish` | Admin | Set Finished + score |
| DELETE | `/api/Match/{id}` | Admin | Delete |
| GET | `/api/Match?skip=&take=` | — | Paginated list with `MatchFilterDTO` |

**TeamController**
| Method | Path | Auth |
|---|---|---|
| POST | `/api/Team` | Admin |
| GET | `/api/Team/{id}` | — |
| PUT | `/api/Team/{id}` | Admin |
| DELETE | `/api/Team/{id}` | Admin |
| GET | `/api/Team?skip=&take=` | — |
| GET | `/api/Team/{id}/players` | — |
| GET | `/api/Team/{id}/matches` | — |

**ParticipationController** (`[Authorize]` on controller)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/Participation` | Any | Apply to match |
| GET | `/api/Participation?skip=&take=` | Any | Paginated list with filter |
| PUT | `/api/Participation/{id}` | Admin | Update status directly |
| DELETE | `/api/Participation/{id}` | Admin | Hard delete |
| POST | `/api/Participation/{id}/review` | Admin | Applied → Reviewed |
| POST | `/api/Participation/{id}/review-waitlisted` | Admin | Waitlisted → Registered |
| POST | `/api/Participation/{id}/approve` | Admin | Reviewed → Registered/Waitlisted |
| POST | `/api/Participation/{id}/confirm` | Admin | Registered → Confirmed + assign team |
| POST | `/api/Participation/{id}/request-cancellation` | Any | → PendingCancellation |
| POST | `/api/Participation/{id}/approve-cancellation` | Admin | → Cancelled |
| POST | `/api/Participation/{id}/reject-cancellation` | Admin | → Confirmed |
| POST | `/api/Participation/{id}/admin-cancel` | Admin | → Cancelled (direct, with CancellationType) |

## MediatR Pipeline Behaviors (ordered)

1. `ValidationBehavior<,>` — runs FluentValidation
2. `FinishedMatchValidationBehavior<,>` — blocks commands on finished matches (for `IParticipationCommand`)
3. `TeamExistenceValidationBehavior<,>` — checks team exists (for `ITeamCommand`)
4. `MatchExistenceValidationBehavior<,>` — checks match exists (for `IMatchCommand`)

Mark commands with the corresponding marker interface (`IParticipationCommand`, `IMatchCommand`, `ITeamCommand`) to activate the relevant behaviors.

## Exception → HTTP Mapping (`ExceptionHandlerMiddleware`)

| Exception | HTTP Status |
|---|---|
| `NotFoundException` | 404 |
| `BadRequestException` | 400 |
| `AlreadyExistException` | 500 |
| Other | 500 |

Response body: `{ "statusCode": N, "message": "..." }` (camelCase JSON).

## gRPC Notification Integration

The Schedule service calls the Notifications service via gRPC to dispatch notifications on participation events.

- Client: `NotificationGrpcClient` implements `INotificationService` (domain interface)
- Proto: `Schedule.Infrastructure/Protos/Notification.proto`
- Config: `NotificationGrpc:Address` in `appsettings.json` (default `http://localhost:9090`)
- Requires `System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport = true` for unencrypted HTTP/2

## Infrastructure

- **DbContext**: `ApplicationDbContext`, EF Core + Npgsql
- Repositories: `MatchRepository`, `ParticipationRepository`, `TeamRepository` (all extend `BaseRepository`)
- **UnitOfWork** pattern
- **Migration retry**: up to 10 retries with 2s delay; skipped in `Test` environment

## Configuration

```json
{
  "ConnectionStrings": { "DefaultConnection": "Host=postgres;Port=5432;Database=schedule_db;..." },
  "JwtSettings": { "Secret": "...", "Issuer": "Vball_app_server", "Audience": "Vball_app_client" },
  "NotificationGrpc": { "Address": "http://localhost:9090" }
}
```

JWT validation: validates signature and lifetime only (`ValidateIssuer = false`, `ValidateAudience = false`).

## Running Tests

```bash
dotnet test Schedule.IntegrationTests
```

Uses Testcontainers to spin up a real PostgreSQL container. Also uses Bogus (fake data), Moq, FluentAssertions.
