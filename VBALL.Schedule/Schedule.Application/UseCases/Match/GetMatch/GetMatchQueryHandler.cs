using AutoMapper;
using MediatR;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Match.GetMatch
{
    public class GetMatchQueryHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<GetMatchQuery, Domain.Entities.Match?>
    {
        public async Task<Domain.Entities.Match?> Handle(GetMatchQuery request, CancellationToken cancellationToken)
        {
            var match = await unitOfWork.MatchRepository.GetByIdAsynd(request.id, cancellationToken);
            if (match is null)
            {
                throw new Exception("Match not found");
            }

            return match;
        }
    }
}
