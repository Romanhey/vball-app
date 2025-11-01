using MediatR;
using Schedule.Application.Exeptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.DeleteParticipation
{
    public record DeleteParticipationCommandHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<DeleteParticipationCommand>
    {
        public async Task Handle(DeleteParticipationCommand request, CancellationToken cancellationToken)
        {
            var participation = await unitOfWork.ParticipationRepository.GetByIdAsync(request.participationId, cancellationToken);

            if (participation is null) throw new NotFoundException("Participation not found");

            await unitOfWork.ParticipationRepository.DeleteAsync(participation);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
