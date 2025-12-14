using MediatR;
using Schedule.Application.Behaviors;
using Schedule.Application.DTO.Participation;

namespace Schedule.Application.UseCases.Participation.AdminCancelParticipation
{
    public record AdminCancelParticipationCommand(
        int ParticipationId,
        AdminCancelParticipationDTO Dto
    ) : IRequest, IParticipationCommand;
}
