using MediatR;

namespace Schedule.Application.UseCases.Team.DeleteTeam
{
    public record DeleteTeamCommand(int TeamId) : IRequest;
}
