using MediatR;
using Schedule.Domain.IRepositories;
using System.Linq.Expressions;

namespace Schedule.Application.UseCases.Match.GetAllMatches
{
    public class GetAllQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllMatchesQuery, List<Domain.Entities.Match>>
    {
        public async Task<List<Domain.Entities.Match>> Handle(GetAllMatchesQuery request, CancellationToken cancellationToken)
        {
            var filter = request.DTO;
            Expression<Func<Domain.Entities.Match, bool>>? expr = null;

            if (filter.FromDate.HasValue || filter.ToDate.HasValue)
            {
                var dateSpec = new DateIntervalSpecification<Domain.Entities.Match>(m => m.StartTime, filter.FromDate, filter.ToDate);
                expr = dateSpec.ToExpression();
            }

            if (filter.TeamId.HasValue)
            {
                Expression<Func<Domain.Entities.Match, bool>> teamExpr = m => m.TeamAId == filter.TeamId.Value || m.TeamBId == filter.TeamId.Value;
                expr = expr == null ? teamExpr : Combine(expr, teamExpr);
            }

            if (filter.Status.HasValue)
            {
                Expression<Func<Domain.Entities.Match, bool>> statusExpr = m => m.Status == filter.Status.Value;
                expr = expr == null ? statusExpr : Combine(expr, statusExpr);
            }

            if (expr == null)
            {
                return await unitOfWork.MatchRepository.GetAsync<Domain.Entities.Match>(skip: request.skip, take: request.take, cancellationToken: cancellationToken);
            }
            return await unitOfWork.MatchRepository.GetAsync<Domain.Entities.Match>(expr, skip: request.skip, take: request.take, cancellationToken: cancellationToken);
        }

        private static Expression<Func<Domain.Entities.Match, bool>> Combine(Expression<Func<Domain.Entities.Match, bool>> expr1, Expression<Func<Domain.Entities.Match, bool>> expr2)
        {
            var param = Expression.Parameter(typeof(Domain.Entities.Match));
            var body = Expression.AndAlso(
                Expression.Invoke(expr1, param),
                Expression.Invoke(expr2, param)
            );
            return Expression.Lambda<Func<Domain.Entities.Match, bool>>(body, param);
        }
    }
}
