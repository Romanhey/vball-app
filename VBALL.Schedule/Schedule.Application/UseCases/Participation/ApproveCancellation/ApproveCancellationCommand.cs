using MediatR;

namespace Schedule.Application.UseCases.Participation.ApproveCancellation
{
    public record ApproveCancellationCommand(int ParticipationId) : IRequest;
}
