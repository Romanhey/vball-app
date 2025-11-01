using MediatR;

namespace Schedule.Application.UseCases.Team.GetAllTeams
{
    public record GetAllTeamsQuery(): IRequest<List<Domain.Entities.Team>>;
}
