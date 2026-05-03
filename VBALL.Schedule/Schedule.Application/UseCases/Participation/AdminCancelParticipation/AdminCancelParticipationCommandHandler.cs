using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;
using Schedule.Domain.Services;

namespace Schedule.Application.UseCases.Participation.AdminCancelParticipation
{
    public class AdminCancelParticipationCommandHandler(
        IUnitOfWork unitOfWork,
        INotificationService notificationService
    ) : IRequestHandler<AdminCancelParticipationCommand>
    {
        public async Task Handle(AdminCancelParticipationCommand request, CancellationToken cancellationToken)
        {
            var participation = (await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken))!;

            if (participation.Status == ParticipationStatus.Cancelled)
            {
                throw new BadRequestException("Participation is already cancelled");
            }

            if (request.Dto.CancellationType != CancellationType.AdminDecision &&
                request.Dto.CancellationType != CancellationType.Emergency)
            {
                throw new BadRequestException("Admin can only use AdminDecision or Emergency cancellation types");
            }

            participation.Status = ParticipationStatus.Cancelled;
            participation.CancellationType = request.Dto.CancellationType;
            participation.CancellationReason = request.Dto.Reason;
            participation.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            var reasonPart = string.IsNullOrWhiteSpace(request.Dto.Reason)
                ? string.Empty
                : $" Причина: {request.Dto.Reason}";

            await notificationService.SendAsync(
                userId: participation.PlayerId.ToString(),
                date: DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss"),
                level: "WARNING",
                content: $"Ваше участие в матче #{participation.MatchId} отменено администратором.{reasonPart}",
                cancellationToken: cancellationToken);
        }
    }
}
