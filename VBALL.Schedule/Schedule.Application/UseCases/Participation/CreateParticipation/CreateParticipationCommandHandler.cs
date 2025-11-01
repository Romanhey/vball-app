using AutoMapper;
using MediatR;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.CreateParticipation
{
    public class CreateParticipationCommandHandler(
        IMapper mapper,
        IUnitOfWork unitOfWork
        ) : IRequestHandler<CreateParticipationCommand>
    {
        public async Task Handle(CreateParticipationCommand request, CancellationToken cancellationToken)
        {
            await unitOfWork.ParticipationRepository.AddAsync(mapper.Map<Domain.Entities.Participation>(request), cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
