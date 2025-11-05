# Participation Cancellation Workflow

## Обзор

Реализован двухэтапный процесс отмены участия в матче:

1. **Игрок** подаёт запрос на отмену
2. **Администратор** одобряет или отклоняет запрос

## Новый статус

Добавлен статус `PendingCancellation` в enum `ParticipationStatus` - ожидание решения администратора по запросу на отмену.

## API Endpoints

### 1. Запрос на отмену (игрок)

```http
POST /api/participation/{id}/request-cancellation
Content-Type: application/json

{
  "reason": "Не смогу прийти по семейным обстоятельствам"
}
```

**Требования:**

- Участие должно быть в статусе `Confirmed` или `Registered`
- Причина обязательна (max 500 символов)

**Результат:**

- Status → `PendingCancellation`
- CancellationReason → заполняется причиной

---

### 2. Одобрение отмены (админ)

```http
POST /api/participation/{id}/approve-cancellation
```

**Требования:**

- Участие должно быть в статусе `PendingCancellation`

**Результат:**

- Status → `Cancelled`
- CancellationReason сохраняется

---

### 3. Отклонение отмены (админ)

```http
POST /api/participation/{id}/reject-cancellation
```

**Требования:**

- Участие должно быть в статусе `PendingCancellation`

**Результат:**

- Status → `Confirmed`
- CancellationReason → очищается (null)

---

## State Machine (обновленный)

```
Applied → Reviewed, Cancelled
Reviewed → Registered, Waitlisted, Cancelled
Registered → Confirmed, PendingCancellation, Cancelled
Waitlisted → Registered, Cancelled
Confirmed → PendingCancellation, Cancelled
PendingCancellation → Cancelled (approve), Confirmed/Registered (reject)
Cancelled → [final state]
```

## Изменения в сущности Participation

```csharp
public class Participation
{
    // ... existing fields
    public string? CancellationReason { get; set; } // Причина отмены, указанная игроком
}
```

## Созданные файлы

### Use Cases

1. `RequestCancellation/` - запрос на отмену от игрока
   - RequestCancellationCommand.cs
   - RequestCancellationCommandHandler.cs
2. `ApproveCancellation/` - одобрение отмены администратором
   - ApproveCancellationCommand.cs
   - ApproveCancellationCommandHandler.cs
3. `RejectCancellation/` - отклонение отмены администратором
   - RejectCancellationCommand.cs
   - RejectCancellationCommandHandler.cs

### DTOs

- `RequestCancellationDTO.cs` - с обязательным полем Reason

### Validators

- `RequestCancellationCommandValidator.cs` - валидация запроса на отмену
- `ApproveCancellationCommandValidator.cs` - валидация одобрения
- `RejectCancellationCommandValidator.cs` - валидация отклонения

### Controllers

- Добавлены 3 новых endpoint'а в `ParticipationController.cs`

## Бизнес-правила

### RequestCancellation

- ✅ Можно запросить отмену только для `Confirmed` или `Registered` участия
- ✅ Нельзя повторно запросить отмену (если статус уже `PendingCancellation`)
- ✅ Причина отмены обязательна и сохраняется в базе

### ApproveCancellation

- ✅ Можно одобрить только если статус `PendingCancellation`
- ✅ После одобрения статус → `Cancelled` (финальное состояние)

### RejectCancellation

- ✅ Можно отклонить только если статус `PendingCancellation`
- ✅ После отклонения статус → `Confirmed` (возврат к предыдущему состоянию)
- ✅ Причина отмены очищается

## Примечания

- Поле `CancellationReason` nullable - заполняется только при запросе отмены
- Все валидаторы автоматически регистрируются через `AddValidatorsFromAssembly`
- Middleware `ExceptionHandlerMiddleware` обрабатывает все исключения
