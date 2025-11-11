using MediatR;
using Schedule.Application.Behaviors;

namespace Schedule.Application.UseCases.Participation.RejectCancellation
{
    public record RejectCancellationCommand(int ParticipationId) : IRequest, IParticipationCommand;
}
