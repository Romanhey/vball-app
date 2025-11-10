using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.CancelParticipation
{
    public class CancelParticipationCommandHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<CancelParticipationCommand>
    {
        public async Task Handle(CancelParticipationCommand request, CancellationToken cancellationToken)
        {
            var participation = await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken);

            if (participation is null)
            {
                throw new NotFoundException("Participation not found");
            }

            participation.Status = ParticipationStatus.Cancelled;
            participation.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}