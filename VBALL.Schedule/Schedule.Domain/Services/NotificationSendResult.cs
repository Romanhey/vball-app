using System.Diagnostics.CodeAnalysis;

namespace Schedule.Domain.Services;

public record NotificationSendResult(
    bool Success,
    string Message,
    [AllowNull] string NotificationId);
