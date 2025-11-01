using MediatR;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.GetAllParticipations
{
    public class GetAllParticipationsQueryHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<GetAllParticipationsQuery, List<Domain.Entities.Participation>>
    {
        public async Task<List<Domain.Entities.Participation>> Handle(GetAllParticipationsQuery request, CancellationToken cancellationToken)
        {
            return await unitOfWork.ParticipationRepository.GetAllAsync(cancellationToken);
        }
    }
}
