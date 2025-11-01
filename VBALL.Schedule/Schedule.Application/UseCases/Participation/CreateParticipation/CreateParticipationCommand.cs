using MediatR;
using Schedule.Application.DTO.Participation;

namespace Schedule.Application.UseCases.Participation.CreateParticipation
{
    public record class CreateParticipationCommand(CreateParticipationDTO participationDTO) : IRequest;
}
