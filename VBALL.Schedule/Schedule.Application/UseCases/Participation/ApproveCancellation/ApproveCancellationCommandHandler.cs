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
            // Note: Participation existence and match finished validation is handled by FinishedMatchValidationBehavior
            var participation = (await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken))!;

            // Business rule: can only approve pending cancellation requests
            if (participation.Status != ParticipationStatus.PendingCancellation)
            {
                throw new BadRequestException("No pending cancellation request to approve");
            }

            participation.Status = ParticipationStatus.Cancelled;
            participation.CancellationType = CancellationType.PlayerRequest;
            participation.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
