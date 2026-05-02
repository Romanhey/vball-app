# CLAUDE.md — VBALL.Notifications

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Service Does

Spring Boot service that receives notifications from the Schedule service via gRPC and exposes them to clients via a REST HTTP API. Notifications are stored **in-memory only** — they are lost on restart.

## Ports

- HTTP REST: `8080`
- gRPC server: `9090`

## Technology Stack

- Java / Spring Boot
- `net.devh.boot.grpc` (grpc-spring-boot-starter) for the gRPC server
- Maven (`pom.xml`)
- No database — in-memory `ConcurrentLinkedDeque` via `NotificationStore`

## Package Structure

```
com.example.notification/
  controller/    — REST controller
  service/       — business logic
  repository/    — in-memory store (NotificationStore)
  grpc/          — gRPC service implementation
  model/         — Notification entity
  dto/           — NotificationRequest, NotificationResponse
  exception/     — NotificationNotFoundException, GlobalExceptionHandler
  config/        — CorsConfig
```

## REST API (`/api/notifications`)

| Method | Path | Description |
|---|---|---|
| GET | `/api/notifications` | All notifications (sorted by createdAt) |
| GET | `/api/notifications/recent` | Notifications from last 2 days |
| GET | `/api/notifications/{id}` | By id |
| POST | `/api/notifications` | Create manually |
| PUT | `/api/notifications/{id}` | Update |
| DELETE | `/api/notifications/{id}` | Delete |

**NotificationRequest** fields: `title`, `message`, `type` (optional, defaults to `"INFO"`)
**NotificationResponse** fields: `id`, `title`, `message`, `type`, `createdAt`

## gRPC API

Proto file: `src/main/proto/notification.proto` (matches the client proto in Schedule service)

```protobuf
service NotificationGrpcService {
  rpc SendNotification (NotificationRequest) returns (NotificationResponse);
  rpc SendNotifications (stream NotificationRequest) returns (NotificationResponse);
}
```

Request fields: `user_id`, `date` (ISO datetime string), `level`, `content`

The gRPC handler (`NotificationGrpcServiceImpl`) delegates to `NotificationService.createNotificationFromGrpc()`. The `level` field becomes both the `title` and `type` of the stored notification. `user_id` is accepted but currently not stored.

## In-Memory Store

`NotificationStore` uses a `ConcurrentLinkedDeque<Notification>` with `AtomicLong` for ID generation. All data is lost on service restart. There is no persistence layer.

## Running

```bash
# From VBALL.Notifications/
mvn spring-boot:run

# Tests
mvn test
```

## Configuration (`application.properties`)

```properties
server.port=8080
grpc.server.port=9090
grpc.server.security.enabled=false
```
