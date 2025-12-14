using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.RequestCancellation
{
    public class RequestCancellationCommandHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<RequestCancellationCommand>
    {
        public async Task Handle(RequestCancellationCommand request, CancellationToken cancellationToken)
        {
            // Validation handled by FluentValidation AutoValidation
            // Note: Participation existence and match finished validation is handled by FinishedMatchValidationBehavior
            var participation = (await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken))!;

            // Business rule: player can request cancellation from Applied, Reviewed, Waitlisted, Registered statuses
            // Confirmed participation can only be cancelled by admin
            var allowedStatuses = new[] {
                ParticipationStatus.Applied,
                ParticipationStatus.Reviewed,
                ParticipationStatus.Waitlisted,
                ParticipationStatus.Registered
            };

            if (!allowedStatuses.Contains(participation.Status))
            {
                throw new BadRequestException("Can only request cancellation for Applied, Reviewed, Waitlisted or Registered participation. Confirmed participation can only be cancelled by admin.");
            }

            if (participation.Status == ParticipationStatus.PendingCancellation)
            {
                throw new BadRequestException("Cancellation request already exists");
            }

            participation.Status = ParticipationStatus.PendingCancellation;
            participation.CancellationReason = request.Dto.Reason;
            participation.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
