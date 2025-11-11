using MediatR;
using Schedule.Application.Behaviors;
using Schedule.Application.DTO.Participation;

namespace Schedule.Application.UseCases.Participation.RequestCancellation
{
    public record RequestCancellationCommand(int ParticipationId, RequestCancellationDTO Dto) : IRequest, IParticipationCommand;
}
