using MediatR;
using Schedule.Domain.IRepositories;
using Schedule.Domain.Specification;
using Schedule.Domain.Specification.MatchSpecifications;

namespace Schedule.Application.UseCases.Team.GetAllTeams
{
    public class GetAllTeamsQueryHandler(IUnitOfWork unitOfWork) 
        : IRequestHandler<GetAllTeamsQuery, List<Domain.Entities.Team>>
    {
        public async Task<List<Domain.Entities.Team>> Handle(GetAllTeamsQuery request, CancellationToken cancellationToken)
        {
            var dto = request.DTO; 
            Specification<Domain.Entities.Team> spec = new TrueSpecification<Domain.Entities.Team>();

            if (dto.TeamId.HasValue)
            {
                spec &= new ValueSpecification<Domain.Entities.Team, int>(x => x.TeamId, [dto.TeamId.Value]);
            }

            if (!string.IsNullOrEmpty(dto.Name))
            {
                spec &= new StringContainsSpecification<Domain.Entities.Team>(x => x.Name, dto.Name);
            }

            if (dto.MinRating.HasValue || dto.MaxRating.HasValue)
            {
                spec &= new RangeSpecification<Domain.Entities.Team, double>(
                    x => x.Rating, 
                    dto.MinRating, 
                    dto.MaxRating
                );
            }

            return await unitOfWork.TeamRepository.GetAsync<Domain.Entities.Team>(
                filter: spec.ToExpression(),
                skip: request.skip,
                take: request.take,
                cancellationToken: cancellationToken
            );
        }
    }
}