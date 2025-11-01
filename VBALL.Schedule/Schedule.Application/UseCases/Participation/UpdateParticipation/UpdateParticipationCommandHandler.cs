using MediatR;
using Schedule.Application.Exceptions;
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

            if (participation is null) throw new NotFoundException("Participation not found");

            participation.Status = request.Dto.Status;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
