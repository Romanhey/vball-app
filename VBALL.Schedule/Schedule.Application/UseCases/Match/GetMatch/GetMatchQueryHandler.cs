using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.IRepositories;
using Schedule.Domain.Specification.MatchSpecifications;

namespace Schedule.Application.UseCases.Match.GetMatch
{
    public class GetMatchQueryHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<GetMatchQuery, Domain.Entities.Match?>
    {
        public async Task<Domain.Entities.Match?> Handle(GetMatchQuery request, CancellationToken cancellationToken)
        {
            var filter = new ValueSpecification<Domain.Entities.Match, int>(m => m.MatchId, [request.Id]);
            var matches = await unitOfWork.MatchRepository.GetAsync<Domain.Entities.Match>(
                filter: filter.ToExpression(),
                cancellationToken: cancellationToken
            );
            var match = matches.FirstOrDefault();
            if (match is null)
            {
                throw new NotFoundException("Match not found");
            }
            return match;
        }
    }
}
