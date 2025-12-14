using AutoMapper;
using MediatR;
using Schedule.Application.Exeptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Team.GetTeam
{
    public class GetTeamQueryHandler(
        IUnitOfWork unitOfWork,
        IMapper mapper
        ) : IRequestHandler<GetTeamQuery, Domain.Entities.Team?>
    {
        public async Task<Domain.Entities.Team?> Handle(GetTeamQuery request, CancellationToken cancellationToken)
        {
            var team = await unitOfWork.TeamRepository.GetByIdAsync(request.teamId, cancellationToken);

            if (team is null) throw new NotFoundException();

            return team;
        }
    }
}
