using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Team.GetTeam
{
    public class GetTeamQueryHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<GetTeamQuery, Domain.Entities.Team?>
    {
        public async Task<Domain.Entities.Team?> Handle(GetTeamQuery request, CancellationToken cancellationToken)
        {
            var team = await unitOfWork.TeamRepository.GetByIdAsync(request.TeamId, cancellationToken);

            if (team is null) throw new NotFoundException("Team not found");

            return team;
        }
    }
}
