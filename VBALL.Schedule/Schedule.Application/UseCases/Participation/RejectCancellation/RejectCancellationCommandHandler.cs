using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;
using Schedule.Domain.Services;

namespace Schedule.Application.UseCases.Participation.RejectCancellation
{
    public class RejectCancellationCommandHandler(
        IUnitOfWork unitOfWork,
        INotificationService notificationService
    ) : IRequestHandler<RejectCancellationCommand>
    {
        public async Task Handle(RejectCancellationCommand request, CancellationToken cancellationToken)
        {
            // Note: Participation existence and match finished validation is handled by FinishedMatchValidationBehavior
            var participation = (await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken))!;

            if (participation.Status != ParticipationStatus.PendingCancellation)
            {
                throw new BadRequestException("No pending cancellation request to reject");
            }

            // Business rule: rejection returns participant to Registered status (not Confirmed)
            // Player must go through confirmation process again
            participation.Status = ParticipationStatus.Registered;
            participation.CancellationReason = null;
            participation.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            await notificationService.SendAsync(
                userId: participation.PlayerId.ToString(),
                date: DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss"),
                level: "WARNING",
                content: $"Ваш запрос на отмену участия в матче #{participation.MatchId} отклонён. Вы остаётесь в составе.",
                cancellationToken: cancellationToken);
        }
    }
}
