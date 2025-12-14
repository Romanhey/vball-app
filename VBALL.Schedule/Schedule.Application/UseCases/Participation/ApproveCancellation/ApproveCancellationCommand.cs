using MediatR;
using Schedule.Application.Behaviors;

namespace Schedule.Application.UseCases.Participation.ApproveCancellation
{
    public record ApproveCancellationCommand(int ParticipationId) : IRequest, IParticipationCommand;
}
