using MediatR;

namespace Schedule.Application.UseCases.Participation.RejectCancellation
{
    public record RejectCancellationCommand(int ParticipationId) : IRequest;
}
