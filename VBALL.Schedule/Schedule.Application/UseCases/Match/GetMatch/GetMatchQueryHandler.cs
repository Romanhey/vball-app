using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.IRepositories;
using Schedule.Domain.Specification.MatchSpecifications;
using Schedule.Domain.Services;
using Microsoft.AspNetCore.Http;

namespace Schedule.Application.UseCases.Match.GetMatch
{
    public class GetMatchQueryHandler(
        IUnitOfWork unitOfWork,
        INotificationService notificationService,
        IHttpContextAccessor httpContextAccessor
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

            var userId = "123";
            
            await notificationService.SendAsync(
                userId: userId,
                date: match.StartTime.ToString("yyyy-MM-dd"),
                level: "info",
                content: $"Match {match.MatchId} has been started"
            );

            return match;
        }
    }
}
