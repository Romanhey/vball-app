using MediatR;
using Schedule.Application.DTO.Team;

namespace Schedule.Application.UseCases.Team.UpdateTeam
{
    public record UpdateTeamCommand(int teamId, UpdateTeamDTO dto) : IRequest;
}
