using MediatR;
using Schedule.Application.Behaviors;
using Schedule.Application.Exceptions;
using Schedule.Domain.Constants;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.ReviewParticipation
{
    public class ReviewParticipationCommandHandler(IUnitOfWork unitOfWork)
        : IRequestHandler<ReviewParticipationCommand>
    {
        public async Task Handle(ReviewParticipationCommand request, CancellationToken cancellationToken)
        {
            // Note: Participation existence and match finished validation is handled by FinishedMatchValidationBehavior
            var participation = (await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken))!;

            // Business rule: can only review from Applied status
            if (participation.Status != ParticipationStatus.Applied)
            {
                throw new BadRequestException("Only participation with Applied status can be reviewed");
            }

            // Business rule: if already 14 registered players, move to Waitlisted instead
            var registeredCount = await unitOfWork.ParticipationRepository
                .GetActiveParticipationCountForMatchAsync(participation.MatchId, cancellationToken);

            if (registeredCount >= ScheduleConstants.MaxPlayersPerMatch)
            {
                // Автоматический переход Applied → Waitlisted (минуя Reviewed)
                participation.Status = ParticipationStatus.Waitlisted;
            }
            else
            {
                participation.Status = ParticipationStatus.Reviewed;
            }

            participation.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
