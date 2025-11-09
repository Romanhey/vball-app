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
            {
                throw new NotFoundException("Participation not found");
            }

            if (participation.Status != ParticipationStatus.PendingCancellation)
            {
                throw new BadRequestException("No pending cancellation request to reject");
            }

            participation.Status = ParticipationStatus.Confirmed;
            participation.CancellationReason = null; 
            participation.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
