using MediatR;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Team.GetAllTeams
{
    public class GetAllTeamsQueryHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<GetAllTeamsQuery, List<Domain.Entities.Team>>
    {
        public async Task<List<Domain.Entities.Team>> Handle(GetAllTeamsQuery request, CancellationToken cancellationToken)
        {
            return await unitOfWork.TeamRepository.GetAllAsync(cancellationToken);
        }
    }
}
