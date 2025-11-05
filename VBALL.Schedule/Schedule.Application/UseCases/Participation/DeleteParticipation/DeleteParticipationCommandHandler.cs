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
            var participation = await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken);

            if (participation is null) return;

            await unitOfWork.ParticipationRepository.DeleteAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
