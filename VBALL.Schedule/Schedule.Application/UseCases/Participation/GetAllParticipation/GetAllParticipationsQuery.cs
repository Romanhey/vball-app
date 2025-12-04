using MediatR;
using Schedule.Application.DTO.Participation;

namespace Schedule.Application.UseCases.Participation.GetAllParticipation
{
    public record GetAllParticipationQuery(ParticipationFilterDTO DTO, int skip, int take) : IRequest<List<Domain.Entities.Participation>>;
}
