using MediatR;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;
using Schedule.Domain.Specification;
using Schedule.Domain.Specification.MatchSpecifications;
namespace Schedule.Application.UseCases.Match.GetAllMatches
{
    public class GetAllQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAllMatchesQuery, List<Domain.Entities.Match>>
    {
        public async Task<List<Domain.Entities.Match>> Handle(GetAllMatchesQuery request, CancellationToken cancellationToken)
        {
            Specification<Domain.Entities.Match> filter = new TrueSpecification<Domain.Entities.Match>();

            var dto = request.DTO;

            if (dto.TeamId is not null)
            {
                var teamAIdSpec = new ValueSpecification<Domain.Entities.Match, int>(x => x.TeamAId, [dto.TeamId.Value]);
                var teamBIdSpec = new ValueSpecification<Domain.Entities.Match, int>(x => x.TeamBId, [dto.TeamId.Value]);

                filter &= teamAIdSpec.Or(teamBIdSpec);
            }

            if (dto.FromDate is not null && dto.ToDate is not null)
            {
                var dateSpec = new DateIntervalSpecification<Domain.Entities.Match>(x => x.StartTime, dto.FromDate.Value, dto.ToDate.Value);

                filter &= dateSpec;
            }
            else if (dto.FromDate is not null)
            {
                var dateSpec = new DateIntervalSpecification<Domain.Entities.Match>(x => x.StartTime, dto.FromDate.Value, null);

                filter &= dateSpec;
            }
            else if (dto.ToDate is not null)
            {
                var dateSpec = new DateIntervalSpecification<Domain.Entities.Match>(x => x.StartTime, null, dto.ToDate.Value);

                filter &= dateSpec;
            }

            if (dto.Status is not null)
            {
                var statusSpec = new ValueSpecification<Domain.Entities.Match, MatchStatus>(x => x.Status, [dto.Status.Value]);
                filter &= statusSpec;
            }

            return await unitOfWork.MatchRepository.GetAsync<Domain.Entities.Match>(
                    filter: filter.ToExpression(),
                    skip: request.skip,
                    take: request.take,
                    cancellationToken: cancellationToken
                );
        }
    }
}
