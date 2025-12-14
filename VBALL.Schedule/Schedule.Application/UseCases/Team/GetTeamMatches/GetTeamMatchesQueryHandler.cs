using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.IRepositories;
using MatchEntity = Schedule.Domain.Entities.Match;

namespace Schedule.Application.UseCases.Team.GetTeamMatches
{
    public class GetTeamMatchesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetTeamMatchesQuery, List<MatchEntity>>
    {
        public async Task<List<MatchEntity>> Handle(GetTeamMatchesQuery request, CancellationToken cancellationToken)
        {
            // Проверяем существование команды
            var team = await unitOfWork.TeamRepository.GetByIdAsync(request.TeamId, cancellationToken);
            if (team is null)
                throw new NotFoundException("Team not found");

            return await unitOfWork.MatchRepository.GetMatchesByTeamIdAsync(request.TeamId, cancellationToken);
        }
    }
}
