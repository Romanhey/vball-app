using MediatR;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Match.GetAllMatches
{
    public class GetAllQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllMatchesQuery, List<Domain.Entities.Match>>
    {
        public async Task<List<Domain.Entities.Match>> Handle(GetAllMatchesQuery request, CancellationToken cancellationToken)
        {
            return await unitOfWork.MatchRepository.GetAllAsync(cancellationToken);
        }
    }
}
