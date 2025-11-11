using MediatR;
using Schedule.Application.Behaviors;

namespace Schedule.Application.UseCases.Participation.ReviewWaitlistedParticipation
{
    public record ReviewWaitlistedParticipationCommand(int ParticipationId) : IRequest, IParticipationCommand;
}
