# CLAUDE.md — VBALL.Identity

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Service Does

ASP.NET Core 8 microservice responsible for user authentication and identity management. Issues JWT access tokens (short-lived, 10 min) and manages refresh tokens stored in HTTP-only cookies (7-day expiry). Also exposes a user profile query API consumed by other services and clients.

## Ports & Paths

- Dev: `http://localhost:5000`
- Docker/nginx: `/identity/` prefix

## Layer Structure

```
Identity.Domain/           — entities, repository interfaces, service interfaces
Identity.Application/      — MediatR commands/queries, validators, AutoMapper profiles
Identity.Infrasructure/    — EF Core + PostgreSQL, service implementations, migrations
Identity.Presentation/     — ASP.NET controllers, DI wiring, Program.cs
Identity.Tests/            — xUnit integration tests
```

> Note: there are two infrastructure folders (`Identity.Infrasructure/` and `Identity.Infrastructure/`). The active one registered in DI is `Identity.Infrasructure/` (with the typo). Migrations exist in both folders — they are duplicates.

## Domain Model

**User** (`Identity.Domain/Entities/User.cs`)
- `Id` (int), `Email`, `Name`, `Password` (hashed), `IsAdmin` (bool)

**RefreshTokenModel** — not a DB entity, just a DTO/model used in the JWT service (`Domain/Models/RefreshTokenModel.cs`)
- `RefreshToken` (string), `RefreshTokenExpireDate`

## JWT Claims

Tokens are signed with HMAC-SHA256. Claims emitted per user:
| Claim | Value |
|---|---|
| `uid` | User.Id (string) |
| `email` | User.Email |
| `adm` | `"1"` if admin, `"0"` otherwise |
| `ClaimTypes.Role` | `"Admin"` or `"Player"` |

Token expiry: `JwtSettings:ExpiryMinutes` (default 10 min). Refresh token: 32-byte random base64 string, stored in HTTP-only cookie, expires in `JwtSettings:RefreshTokenExpiryDays` (default 7 days).

## API Endpoints

**AuthController** — `POST /api/Auth/...` (no auth required except refresh)
- `POST /api/Auth/register` — register user
- `POST /api/Auth/login` — returns `{ AccesToken: "..." }` (note the typo: `AccesToken`, not `AccessToken`)
- `POST /api/Auth/refresh-token` — `[Authorize]`, reads refresh token from cookie, returns new access token

**UsersController** — `GET /api/Users/...` (all require `[Authorize]`)
- `GET /api/Users/me` — returns current user profile (uses `uid` claim)
- `GET /api/Users/{id}` — `[Authorize(Roles = "Admin")]`
- `GET /api/Users?ids=1&ids=2` — bulk lookup by IDs, `[Authorize(Roles = "Admin")]`

## Application Layer

MediatR handlers (no pipeline behaviors beyond FluentValidation auto-validation):
- `RegisterUserCommand` / `LoginUserCommand` / `RefreshAccessTokenCommand`
- `GetUserByIdQuery` / `GetUsersByIdsQuery`

Validators registered explicitly (not via assembly scan):
- `RegisterUserCommandValidation`, `LoginUserCommandValidation`

## Infrastructure

- **DbContext**: `ApplicationDbContext` — EF Core with Npgsql
- **Services**: `JWTService` (token generation), `PasswordHasher` (BCrypt or similar), `CookieService` (read/write refresh token cookie)
- **UnitOfWork** + `UserRepository`
- **Migration retry**: on startup, retries up to 10 times with 2s delay before failing

## Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": { "DefaultConnection": "Host=postgres;Port=5432;Database=identity_db;..." },
  "JwtSettings": {
    "Secret": "...",
    "Issuer": "Vball_app_server",
    "Audience": "Vball_app_client",
    "ExpiryMinutes": 10,
    "RefreshTokenExpiryDays": 7
  }
}
```

## Running Tests

```bash
dotnet test Identity.Tests
```

Tests use `WebApplicationFactory` + `IdentityWebApplicationFactory` fixture. Test classes share a collection fixture (`IdentityCollection`).

## Known Issues / Quirks

- Login response field is `AccesToken` (one 's') — clients must handle both `AccesToken` and `AccessToken` spellings.
- Two infrastructure project folders exist due to a rename; only `Identity.Infrasructure/` is active in DI.
