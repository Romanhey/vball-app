using System.Threading;
using System.Threading.Tasks;

namespace Schedule.Domain.Services;

public interface INotificationService
{
    Task<NotificationSendResult> SendAsync(
        string userId,
        string date,
        string level,
        string content,
        CancellationToken cancellationToken = default);
}
