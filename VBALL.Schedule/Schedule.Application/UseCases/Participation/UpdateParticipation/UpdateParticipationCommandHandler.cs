using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.UpdateParticipation
{
    public class UpdateParticipationCommandHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<UpdateParticipationCommand>
    {
        public async Task Handle(UpdateParticipationCommand request, CancellationToken cancellationToken)
        {
            // Note: Participation existence and match finished validation is handled by FinishedMatchValidationBehavior
            var participation = (await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken))!;

            participation.Status = request.Dto.Status;
            participation.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
