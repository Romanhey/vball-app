/**
 * Extracts error message from API response (supports both camelCase and PascalCase).
 */
function extractApiErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: Record<string, unknown> | string };
    message?: string;
  };

  if (!err) return '';

  const data = err?.response?.data;
  if (typeof data === 'string' && data.trim()) return data.trim();

  if (data && typeof data === 'object') {
    const msg =
      (data.message as string) ??
      (data.Message as string) ??
      (data.error as string);
    if (typeof msg === 'string' && msg.trim()) return msg.trim();

    const errors = data.errors as Record<string, string[] | string> | undefined;
    if (errors && typeof errors === 'object') {
      for (const value of Object.values(errors)) {
        if (Array.isArray(value) && value.length > 0 && value[0]) {
          return String(value[0]).trim();
        }
        if (typeof value === 'string' && value.trim()) {
          return value.trim();
        }
      }
    }
  }

  if (typeof err?.message === 'string' && err.message.trim()) {
    return err.message.trim();
  }

  return '';
}

const ERROR_TRANSLATIONS: Array<{ pattern: RegExp | string; translation: string }> = [
  { pattern: /A match cannot be scheduled in the past/i, translation: 'Нельзя запланировать матч на прошедшую дату' },
  { pattern: /A team cannot play against itself/i, translation: 'Команда не может играть сама с собой' },
  { pattern: /One or both teams were not found/i, translation: 'Одна или обе команды не найдены' },
  { pattern: /Team name is required/i, translation: 'Укажите название команды' },
  { pattern: /Team name must not exceed 100 characters/i, translation: 'Название команды не должно превышать 100 символов' },
  { pattern: /Rating must be at least 0/i, translation: 'Рейтинг должен быть не менее 0' },
  { pattern: /Rating must not exceed 10/i, translation: 'Рейтинг не должен превышать 10' },
  { pattern: /Player already has an active participation for this match/i, translation: 'У игрока уже есть заявка на этот матч' },
  { pattern: /Only participation with Registered status can be confirmed/i, translation: 'Подтвердить можно только заявку со статусом «Зарегистрирован»' },
  { pattern: /Only participation with Reviewed status can be approved/i, translation: 'Одобрить можно только заявку со статусом «Рассмотрена»' },
  { pattern: /Only participation with Applied status can be reviewed/i, translation: 'Рассмотреть можно только заявку со статусом «Подана»' },
  { pattern: /Only participation with Waitlisted status can be reviewed from waitlist/i, translation: 'Из листа ожидания можно рассмотреть только заявку со статусом «В листе ожидания»' },
  { pattern: /Team does not belong to this match/i, translation: 'Команда не участвует в этом матче' },
  { pattern: /Team already has 7 players for this match/i, translation: 'В команде уже 7 игроков на этот матч' },
  { pattern: /Cannot register: match already has \d+ registered players/i, translation: 'Нельзя зарегистрировать: в матче уже максимальное число игроков' },
  { pattern: /No pending cancellation request to reject/i, translation: 'Нет ожидающей заявки на отмену для отклонения' },
  { pattern: /No pending cancellation request to approve/i, translation: 'Нет ожидающей заявки на отмену для одобрения' },
  { pattern: /Cancellation request already exists/i, translation: 'Заявка на отмену уже подана' },
  { pattern: /Participation is already cancelled/i, translation: 'Заявка уже отменена' },
  { pattern: /Admin can only use AdminDecision or Emergency cancellation types/i, translation: 'Админ может отменять только с типом «Решение админа» или «Экстренная отмена»' },
  { pattern: /Can only request cancellation for Applied, Reviewed, Waitlisted or Registered participation/i, translation: 'Отменить можно только заявку со статусом «Подана», «Рассмотрена», «В листе ожидания» или «Зарегистрирована»' },
  { pattern: /Confirmed participation can only be cancelled by admin/i, translation: 'Подтверждённую заявку может отменить только администратор' },
  { pattern: /Only a match in progress can be finished/i, translation: 'Завершить можно только матч в процессе' },
  { pattern: /Only a scheduled match can be started/i, translation: 'Начать можно только запланированный матч' },
  { pattern: /Cannot start match: requires exactly \d+ confirmed players/i, translation: 'Нельзя начать матч: требуется ровно 14 подтверждённых игроков' },
  { pattern: /Cannot delete a match that is in progress/i, translation: 'Нельзя удалить матч, который в процессе' },
  { pattern: /Cannot delete a finished match/i, translation: 'Нельзя удалить завершённый матч' },
  { pattern: /Cannot delete team with active matches/i, translation: 'Нельзя удалить команду с активными матчами' },
  { pattern: /Please finish or cancel all matches first/i, translation: 'Сначала завершите или отмените все матчи' },
  { pattern: /Cannot modify participation: match has finished/i, translation: 'Нельзя изменить заявку: матч уже завершён' },
  { pattern: /Match not found/i, translation: 'Матч не найден' },
  { pattern: /TeamAId must be greater than 0/i, translation: 'Укажите первую команду' },
  { pattern: /TeamBId must be greater than 0/i, translation: 'Укажите вторую команду' },
];

/**
 * Translates known server error messages to Russian.
 */
function translateApiError(rawMessage: string): string {
  if (!rawMessage.trim()) return rawMessage;

  for (const { pattern, translation } of ERROR_TRANSLATIONS) {
    if (typeof pattern === 'string') {
      if (rawMessage.toLowerCase().includes(pattern.toLowerCase())) {
        return translation;
      }
    } else if (pattern.test(rawMessage)) {
      return translation;
    }
  }

  return rawMessage;
}

/**
 * Extracts error from API response and translates to user-friendly Russian message.
 */
export function getUserFriendlyError(error: unknown, fallback: string): string {
  const extracted = extractApiErrorMessage(error);
  if (!extracted) return fallback;
  return translateApiError(extracted);
}
