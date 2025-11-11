using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.AdminCancelParticipation
{
    public class AdminCancelParticipationCommandHandler(IUnitOfWork unitOfWork)
        : IRequestHandler<AdminCancelParticipationCommand>
    {
        public async Task Handle(AdminCancelParticipationCommand request, CancellationToken cancellationToken)
        {
            // Note: Participation existence and match finished validation is handled by FinishedMatchValidationBehavior
            var participation = (await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken))!;

            // Business rule: cannot cancel already cancelled participation
            if (participation.Status == ParticipationStatus.Cancelled)
            {
                throw new BadRequestException("Participation is already cancelled");
            }

            // Note: Match finished validation is handled by FinishedMatchValidationBehavior

            // Business rule: only AdminDecision or Emergency cancellation types allowed for admin
            if (request.Dto.CancellationType != CancellationType.AdminDecision &&
                request.Dto.CancellationType != CancellationType.Emergency)
            {
                throw new BadRequestException("Admin can only use AdminDecision or Emergency cancellation types");
            }

            // Direct cancellation by admin (no PendingCancellation status)
            participation.Status = ParticipationStatus.Cancelled;
            participation.CancellationType = request.Dto.CancellationType;
            participation.CancellationReason = request.Dto.Reason;
            participation.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
