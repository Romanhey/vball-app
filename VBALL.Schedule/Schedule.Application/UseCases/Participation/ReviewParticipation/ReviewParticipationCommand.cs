using MediatR;
using Schedule.Application.Behaviors;

namespace Schedule.Application.UseCases.Participation.ReviewParticipation
{
    public record ReviewParticipationCommand(int ParticipationId) : IRequest, IParticipationCommand;
}
