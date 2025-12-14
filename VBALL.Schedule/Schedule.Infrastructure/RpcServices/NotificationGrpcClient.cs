using Grpc.Core;
using Microsoft.Extensions.Logging;
using Schedule.Domain.Services;
using Schedule.Infrastructure.Protos;

namespace Schedule.Infrastructure.RpcServices;

public class NotificationGrpcClient : INotificationService
{
    private readonly NotificationGrpcService.NotificationGrpcServiceClient _client;
    private readonly ILogger<NotificationGrpcClient> _logger;

    public NotificationGrpcClient(
        NotificationGrpcService.NotificationGrpcServiceClient client,
        ILogger<NotificationGrpcClient> logger)
    {
        _client = client;
        _logger = logger;
    }

    public async Task<NotificationSendResult> SendAsync(
        string userId,
        string date,
        string level,
        string content,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new NotificationRequest
            {
                UserId = userId,
                Date = date,
                Level = level,
                Content = content
            };

            var response = await _client.SendNotificationAsync(
                request,
                cancellationToken: cancellationToken);

            return new NotificationSendResult(
                response.Success,
                response.Message,
                response.NotificationId);
        }
        catch (RpcException ex)
        {
            _logger.LogError(ex, "Failed to send notification via gRPC");
            return new NotificationSendResult(false, ex.Status.Detail ?? ex.Message, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when sending notification via gRPC");
            return new NotificationSendResult(false, ex.Message, null);
        }
    }
}
