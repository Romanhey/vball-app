using MediatR;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.GetAllParticipation
{
    public class GetAllParticipationQueryHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<GetAllParticipationQuery, List<Domain.Entities.Participation>>
    {
        public async Task<List<Domain.Entities.Participation>> Handle(GetAllParticipationQuery request, CancellationToken cancellationToken)
        {
            return await unitOfWork.ParticipationRepository.GetAsync<Domain.Entities.Participation>(cancellationToken: cancellationToken);
        }
    }
}
