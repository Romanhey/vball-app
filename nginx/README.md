# Nginx Configuration

This nginx configuration provides:
- Reverse proxy for Identity service at `/identity/`
- Reverse proxy for Schedule service at `/schedule/`
- API proxy at `/api/` (routes to Schedule service)
- Static file serving for React client

## Setup Instructions

1. Build the React client:
```bash
docker-compose --profile build up client-build
```

2. Start all services:
```bash
docker-compose up -d
```

The nginx will be available at `http://localhost:80`

## Routes

- `/` - React client (static files)
- `/identity/` - Identity service API
- `/schedule/` - Schedule service API  
- `/api/` - Schedule service API (backward compatibility)
