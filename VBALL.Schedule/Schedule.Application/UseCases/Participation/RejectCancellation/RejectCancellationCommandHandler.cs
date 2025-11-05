using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.RejectCancellation
{
    public class RejectCancellationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<RejectCancellationCommand>
    {
        public async Task Handle(RejectCancellationCommand request, CancellationToken cancellationToken)
        {
            var participation = await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken);

            if (participation is null)
                throw new NotFoundException("Participation not found");

            // Бизнес-правило: можно отклонить только если есть запрос на отмену
            if (participation.Status != ParticipationStatus.PendingCancellation)
            {
                throw new BadRequestException("No pending cancellation request to reject");
            }

            // Возвращаем статус обратно в Confirmed или Registered
            // Проверяем предыдущий статус по логике: если был Confirmed, возвращаем в Confirmed
            participation.Status = ParticipationStatus.Confirmed;
            participation.CancellationReason = null; // Очищаем причину отмены
            participation.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
