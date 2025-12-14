using MediatR;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.DeleteParticipation
{
    public class DeleteParticipationCommandHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<DeleteParticipationCommand>
    {
        public async Task Handle(DeleteParticipationCommand request, CancellationToken cancellationToken)
        {
            // Note: Participation existence and match finished validation is handled by FinishedMatchValidationBehavior
            var participation = (await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken))!;

            await unitOfWork.ParticipationRepository.DeleteAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
