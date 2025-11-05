using MediatR;
using MatchEntity = Schedule.Domain.Entities.Match;

namespace Schedule.Application.UseCases.Team.GetTeamMatches
{
    public record GetTeamMatchesQuery(int TeamId) : IRequest<List<MatchEntity>>;
}
