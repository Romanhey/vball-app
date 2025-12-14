using MediatR;
using Schedule.Application.Behaviors;

namespace Schedule.Application.UseCases.Participation.DeleteParticipation
{
    public record DeleteParticipationCommand(int ParticipationId) : IRequest, IParticipationCommand;
}
