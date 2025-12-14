# Nginx Setup Instructions

## Обзор

Nginx настроен как reverse proxy для:
- **Identity service** - доступен по пути `/identity/`
- **Schedule service** - доступен по пути `/schedule/`
- **API (Schedule)** - доступен по пути `/api/` (для обратной совместимости)
- **React Client** - статические файлы на корневом пути `/`

## Установка и запуск

### 1. Сборка React клиента

Сначала нужно собрать React приложение и скопировать файлы в volume:

```bash
docker-compose --profile build up client-build
```

Это создаст volume `client_static` с собранными статическими файлами.

### 2. Запуск всех сервисов

```bash
docker-compose up -d
```

### 3. Проверка

После запуска nginx будет доступен на `http://localhost:80`

- `http://localhost/` - React приложение
- `http://localhost/api/Match` - Schedule API (обратная совместимость)
- `http://localhost/schedule/api/Match` - Schedule API
- `http://localhost/identity/api/Auth` - Identity API

## Структура файлов

```
nginx/
├── Dockerfile          # Dockerfile для nginx контейнера
├── nginx.conf          # Конфигурация nginx
└── README.md           # Дополнительная документация

VBALL.Client/
└── Dockerfile          # Dockerfile для сборки React приложения
```

## Обновление клиента

Если вы изменили код React приложения, нужно пересобрать:

```bash
# Остановить и удалить старый build контейнер
docker-compose --profile build down client-build

# Пересобрать
docker-compose --profile build up --build client-build

# Перезапустить nginx (чтобы подхватить новые файлы)
docker-compose restart nginx
```

## Troubleshooting

### Статические файлы не отображаются

Проверьте, что volume создан и содержит файлы:
```bash
docker volume inspect vball-app_client_static
docker run --rm -v vball-app_client_static:/data alpine ls -la /data
```

### API не работает

Проверьте логи nginx:
```bash
docker logs vball-nginx
```

Проверьте, что сервисы запущены:
```bash
docker-compose ps
```

### CORS ошибки

CORS настроен на уровне nginx и на уровне сервисов (Identity и Schedule). Если возникают проблемы, проверьте:
1. Конфигурацию CORS в `Program.cs` обоих сервисов
2. Заголовки в `nginx.conf`
