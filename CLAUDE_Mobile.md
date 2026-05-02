# CLAUDE.md — VBALL.Mobile

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Does

React Native mobile app (Expo ~54, expo-router) that mirrors the web client's functionality: match calendar, match details, participation management, notifications, profile, and admin screens.

## Commands

```bash
npx expo start            # start dev server (scan QR or press a/i/w)
npx expo start --android  # Android emulator
npx expo start --ios      # iOS simulator
expo lint                 # ESLint
```

## Key Dependencies

- Expo ~54 / React Native 0.81 / React 19
- expo-router ~6 (file-based routing)
- MobX 6 + mobx-react-lite (same pattern as web client)
- Axios (HTTP)
- `@react-native-async-storage/async-storage` (token persistence, instead of localStorage)
- `@react-native-community/datetimepicker`
- lucide-react-native icons (via `@expo/vector-icons`)

## File-Based Routing (`app/`)

```
app/
  index.tsx                    — root redirect (→ auth or app)
  _layout.tsx                  — root Stack layout
  (auth)/
    _layout.tsx
    login.tsx
    register.tsx
  (app)/
    _layout.tsx                — AppLayout: auth guard + AppDataProvider
    (tabs)/
      _layout.tsx              — bottom tab bar
      index.tsx                — matches/home tab
      profile.tsx
      notifications.tsx
      admin.tsx                — admin shortcut tab (admin-only)
    admin/
      _layout.tsx
      index.tsx                — admin match management
      teams.tsx                — admin team management
    match/
      [id].tsx                 — match detail screen
```

**Auth guard** is in `app/(app)/_layout.tsx`: redirects to `/(auth)/login` if not authenticated; redirects away from admin routes if not admin.

## Source Layout (`src/`)

```
src/
  stores/
    rootStore.tsx              — RootStore, StoreProvider, useAuthStore(), useScheduleStore()
    authStore.ts               — same logic as web: login, logout, refreshToken, isAdmin
  services/
    httpClient.ts              — axios instances (same 3 as web) + setOnUnauthorized() hook
    authService.ts
    matchService.ts
    participationService.ts
    teamService.ts
    userService.ts
    notificationService.ts
  contexts/
    AppDataContext.tsx          — React context that loads all app data (matches, teams, notifications, profile, participations) via Promise.allSettled on auth change
    BottomAdminPanelContext.tsx — context for bottom admin action panel visibility
  components/
    MatchCard.tsx
    FilterChip.tsx
    Icon.tsx
    SideMenu.tsx
    BottomAdminPanel.tsx
  types/index.ts               — all shared TS interfaces (identical to web client types.ts)
  constants/theme.ts
  utils/errorUtils.ts
```

## State & Data Flow

**Auth**: `AuthStore` (MobX) — same design as web. Token persisted via `AsyncStorage` instead of `localStorage`. `setOnUnauthorized(cb)` is called in `AppLayout` to wire up automatic logout on 401.

**App data**: `AppDataContext` (React context, not MobX) — loads matches, teams, notifications, profile, and current user's participations in parallel on mount and whenever auth state changes. Components call `useAppData()` to read this data and `loadAllData()` / `refreshParticipations()` to refresh.

The split: `AuthStore` (MobX) for auth + `AppDataContext` (useState) for domain data.

## HTTP Client Differences vs Web

`src/services/httpClient.ts` exposes `setOnUnauthorized(fn)` instead of the web client's `setupTokenRefresh(fn)`. When a 401 is received and refresh fails (or there is no refresh), the provided callback is invoked (which calls `authStore.logoutSync()` + navigate to login).

## Types

`src/types/index.ts` is identical in content to `VBALL.Client/src/types.ts`. Keep them in sync when modifying shared domain types.

## Theme

`src/constants/theme.ts` and `constants/theme.ts` (root level) both exist. Prefer `src/constants/theme.ts` for components inside `src/`.

## Environment / API URLs

API base URLs are hardcoded in `src/services/httpClient.ts`. For local dev with a physical device, change `localhost` to your machine's LAN IP (e.g., `192.168.x.x`). The `@expo/ngrok` dev dependency is available for tunneling.
