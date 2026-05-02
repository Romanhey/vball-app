# CLAUDE.md — VBALL.Client

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Does

React 19 SPA (Create React App + TypeScript) for the web browser. Provides a calendar/table view of volleyball matches, match details with participation management, and admin screens for managing matches and teams. Uses Tailwind CSS for styling and MobX for state management.

## Commands

```bash
npm start        # dev server (port 3000, proxies to localhost:5000/5054)
npm test         # Jest + React Testing Library
npm run build    # production build to build/
```

## Key Dependencies

- React 19, React Router v6
- MobX 6 + mobx-react-lite (state management)
- Axios (HTTP)
- Tailwind CSS 3 + PostCSS
- date-fns 4 (date formatting)
- react-big-calendar (calendar view)
- lucide-react (icons)
- jwt-decode (client-side JWT parsing)

## Source Layout

```
src/
  routes/AppRouter.tsx       — route definitions
  stores/
    rootStore.tsx            — RootStore, StoreProvider, useAuthStore(), useScheduleStore()
    authStore.ts             — AuthStore (login, logout, token, user, isAdmin)
    scheduleStore.ts         — ScheduleStore (matches[], view: 'calendar'|'table')
  services/
    httpClient.ts            — axios instances + token refresh queue (THE central HTTP layer)
    authService.ts           — login, register, refreshToken calls
    matchService.ts          — match CRUD + start/finish
    participationService.ts  — participation CRUD + state transitions
    teamService.ts           — team CRUD
    userService.ts           — getCurrentUser, getUser
    notificationService.ts   — getRecentNotifications, etc.
  pages/
    CalendarPage/            — main match view (calendar or table)
    MatchDetailsPage/        — match + participation detail
    AdminPage/               — admin match management
    AdminTeamsPage/          — admin team management
    NotFoundPage/
  components/
    layout/Shell.tsx         — app shell (sidebar layout)
    calendar/WeeklyCalendar.tsx
    matches/MatchTable.tsx
    shared/ViewToggle.tsx
    (+ legacy flat components: MatchCard, MatchDetails, SideMenu, etc.)
  config/api.ts              — API URL config (mostly unused in favour of httpClient.ts)
  types.ts                   — all shared TS interfaces and enums
  types/match.ts             — MatchSummary, MatchEvent (calendar-specific)
```

## State Management

`RootStore` holds two stores. Access them via hooks:
```ts
const { authStore, scheduleStore } = useStores();
const authStore = useAuthStore();
const scheduleStore = useScheduleStore();
```

**AuthStore** manages auth lifecycle:
- `login(email, password)` — calls authService, decodes JWT, sets token in localStorage (`vball_access_token`) and store
- `logout()` — clears token from localStorage and store
- `refreshToken()` — called automatically by httpClient on 401; if it fails, calls `logout()`
- `isAuthenticated` — computed: `Boolean(token && user)`
- `isAdmin` — computed: `user.role === 'Admin'`
- JWT claims decoded: `uid` → `user.id`, `email`, `adm === '1'` → role `'Admin'`

**ScheduleStore** is a lightweight store for the schedule view state:
- `matches: MatchSummary[]` — populated by CalendarPage
- `view: 'calendar' | 'table'` — toggled by ViewToggle

## HTTP Client (`services/httpClient.ts`)

Three axios instances, all pre-wired with Bearer token interceptors:
- `identityApiClient` — base `http://localhost:5000` (dev) or `/identity` (prod)
- `scheduleApiClient` — base `http://localhost:5054` (dev) or `/schedule` (prod)
- `notificationsApiClient` — base `http://localhost:8080`

Token refresh logic: on 401, queues concurrent requests and calls `authStore.refreshToken()` once. If refresh fails, clears token and redirects to `/login`. Call `setupTokenRefresh(fn)` once during `AuthStore` construction to wire it up.

Token storage key: `vball_access_token` in `localStorage`.

## Routing

```
/              → redirect to /calendar
/calendar      → CalendarPage
/matches/:id   → MatchDetailsPage
/admin         → AdminPage (placeholder props — needs refactor)
/admin/teams   → AdminTeamsPage (placeholder props — needs refactor)
*              → NotFoundPage
```

> Note: `/admin` and `/admin/teams` routes currently receive placeholder (noop/empty) props in `AppRouter.tsx`. The actual data fetching happens inside the page components via services.

## Types

All domain types in `src/types.ts`. Calendar-specific types in `src/types/match.ts`.

Note: `LoginResponse` handles multiple token field name spellings (`AccesToken`, `accesToken`, `AccessToken`, `accessToken`) to cope with the Identity API's typo.

## Env Variables

| Variable | Dev default | Purpose |
|---|---|---|
| `REACT_APP_IDENTITY_API` | `http://localhost:5000` | Identity service URL |
| `REACT_APP_SCHEDULE_API` | `http://localhost:5054` | Schedule service URL |
| `REACT_APP_NOTIFICATIONS_API` | `http://localhost:8080` | Notifications URL |
