using MediatR;
using Schedule.Application.DTO.Team;

namespace Schedule.Application.UseCases.Team.GetAllTeams
{
    public record GetAllTeamsQuery(TeamFilterDTO DTO, int skip, int take): IRequest<List<Domain.Entities.Team>>;
}
