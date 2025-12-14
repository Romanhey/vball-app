using MediatR;
using Schedule.Application.DTO.Team;

namespace Schedule.Application.UseCases.Team.CreateTeam
{
    public record CreateTeamCommand(CreateTeamDTO Dto) : IRequest;
}
