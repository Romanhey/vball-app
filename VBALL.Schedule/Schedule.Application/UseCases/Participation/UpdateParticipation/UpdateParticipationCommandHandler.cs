using MediatR;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.UpdateParticipation
{
    public class UpdateParticipationCommandHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<UpdateParticipationCommand>
    {
        public async Task Handle(UpdateParticipationCommand request, CancellationToken cancellationToken)
        {
            var participation = await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken);

            // Validation ensures participation exists, but keep null check for safety
            if (participation is null) return;

            participation.Status = request.Dto.Status;
            participation.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
