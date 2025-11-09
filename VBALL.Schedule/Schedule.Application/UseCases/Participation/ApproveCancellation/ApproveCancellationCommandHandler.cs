using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.ApproveCancellation
{
    public class ApproveCancellationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<ApproveCancellationCommand>
    {
        public async Task Handle(ApproveCancellationCommand request, CancellationToken cancellationToken)
        {
            var participation = await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken);

            if (participation is null)
            {
                throw new NotFoundException("Participation not found");
            }

            if (participation.Status != ParticipationStatus.PendingCancellation)
            {
                throw new BadRequestException("No pending cancellation request to approve");
            }

            participation.Status = ParticipationStatus.Cancelled;
            participation.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
