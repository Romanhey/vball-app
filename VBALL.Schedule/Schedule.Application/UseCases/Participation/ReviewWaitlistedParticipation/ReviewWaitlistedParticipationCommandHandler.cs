using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.ReviewWaitlistedParticipation
{
    public class ReviewWaitlistedParticipationCommandHandler(IUnitOfWork unitOfWork)
        : IRequestHandler<ReviewWaitlistedParticipationCommand>
    {
        public async Task Handle(ReviewWaitlistedParticipationCommand request, CancellationToken cancellationToken)
        {
            // Note: Participation existence and match finished validation is handled by FinishedMatchValidationBehavior
            var participation = (await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken))!;

            // Business rule: can only review from Waitlisted status
            if (participation.Status != ParticipationStatus.Waitlisted)
            {
                throw new BadRequestException("Only participation with Waitlisted status can be reviewed from waitlist");
            }

            // Transition: Waitlisted → Reviewed
            // Admin manually moves player from waitlist when spot becomes available
            participation.Status = ParticipationStatus.Reviewed;
            participation.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
