using MediatR;
using Schedule.Domain.IRepositories;
using Schedule.Domain.Entities;
using Schedule.Domain.Specification;
using Schedule.Domain.Specification.MatchSpecifications;

namespace Schedule.Application.UseCases.Participation.GetAllParticipation
{
    public class GetAllParticipationQueryHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<GetAllParticipationQuery, List<Domain.Entities.Participation>>
    {
        public async Task<List<Domain.Entities.Participation>> Handle(GetAllParticipationQuery request, CancellationToken cancellationToken)
        {
            var filter = request.DTO;
            Specification<Domain.Entities.Participation> spec = new TrueSpecification<Domain.Entities.Participation>();

            if (filter.ParticipationId is not null)
            {
                var idSpec = new ValueSpecification<Domain.Entities.Participation, int>(x => x.ParticipationId, [filter.ParticipationId.Value]);
                spec &= idSpec;
            }
            if (filter.MatchId is not null)
            {
                var matchSpec = new ValueSpecification<Domain.Entities.Participation, int>(x => x.MatchId, [filter.MatchId.Value]);
                spec &= matchSpec;
            }
            if (filter.PlayerId is not null)
            {
                var playerSpec = new ValueSpecification<Domain.Entities.Participation, int>(x => x.PlayerId, [filter.PlayerId.Value]);
                spec &= playerSpec;
            }
            if (filter.TeamId is not null)
            {
                var teamSpec = new ValueSpecification<Domain.Entities.Participation, int>(x => x.TeamId.Value, [filter.TeamId.Value]);
                spec &= teamSpec;
            }
            if (filter.CreatedFrom is not null || filter.CreatedTo is not null)
            {
                var dateSpec = new DateIntervalSpecification<Domain.Entities.Participation>(x => x.CreatedAt, filter.CreatedFrom, filter.CreatedTo);
                spec &= dateSpec;
            }
            if (filter.Status is not null)
            {
                var statusSpec = new ValueSpecification<Domain.Entities.Participation, ParticipationStatus>(x => x.Status, [filter.Status.Value]);
                spec &= statusSpec;
            }
            return await unitOfWork.ParticipationRepository.GetAsync<Domain.Entities.Participation>(
                filter: spec.ToExpression(),
                cancellationToken: cancellationToken
            );
        }
    }

}
