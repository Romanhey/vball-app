using MediatR;
using Schedule.Application.DTO.Participation;

namespace Schedule.Application.UseCases.Participation.GetParticipation
{
    public record GetParticipationQuery(int ParticipationId) : IRequest<ParticipationResponseDTO>;

}
