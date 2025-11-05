using AutoMapper;
using MediatR;
using Schedule.Domain.Entities;
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
            var participation = mapper.Map<Domain.Entities.Participation>(request.ParticipationDTO);
            participation.CreatedAt = DateTime.UtcNow;
            participation.Status = ParticipationStatus.Applied;

            await unitOfWork.ParticipationRepository.AddAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
