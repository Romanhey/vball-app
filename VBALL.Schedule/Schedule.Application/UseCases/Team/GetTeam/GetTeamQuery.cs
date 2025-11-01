using MediatR;

namespace Schedule.Application.UseCases.Team.GetTeam
{
    public record GetTeamQuery(int TeamId) : IRequest<Domain.Entities.Team>;
}
