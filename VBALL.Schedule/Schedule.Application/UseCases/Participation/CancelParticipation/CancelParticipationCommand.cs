using MediatR;

namespace Schedule.Application.UseCases.Participation.CancelParticipation
{
    public record CancelParticipationCommand(int ParticipationId) : IRequest;
}