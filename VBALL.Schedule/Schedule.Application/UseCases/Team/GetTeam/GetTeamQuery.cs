using MediatR;

namespace Schedule.Application.UseCases.Team.GetTeam
{
    public record GetTeamQuery(int teamId) : IRequest<Domain.Entities.Team>;
}
