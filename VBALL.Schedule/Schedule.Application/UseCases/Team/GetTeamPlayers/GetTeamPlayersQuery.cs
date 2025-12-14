using MediatR;

namespace Schedule.Application.UseCases.Team.GetTeamPlayers
{
    public record GetTeamPlayersQuery(int TeamId) : IRequest<List<int>>;
}
