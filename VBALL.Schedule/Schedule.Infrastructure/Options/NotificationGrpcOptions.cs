namespace Schedule.Infrastructure.Options;

public class NotificationGrpcOptions
{
    public const string SectionName = "NotificationGrpc";

    public string Address { get; set; } = string.Empty;
}
