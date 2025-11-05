using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Team.GetTeamPlayers
{
    public class GetTeamPlayersQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetTeamPlayersQuery, List<int>>
    {
        public async Task<List<int>> Handle(GetTeamPlayersQuery request, CancellationToken cancellationToken)
        {
            // Проверяем существование команды
            var team = await unitOfWork.TeamRepository.GetByIdAsync(request.TeamId, cancellationToken);
            if (team is null)
                throw new NotFoundException("Team not found");

            return await unitOfWork.TeamAssignmentRepository.GetPlayerIdsByTeamIdAsync(request.TeamId, cancellationToken);
        }
    }
}
