using MediatR;
using Schedule.Application.Exeptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.UpdateParticipation
{
    public class UpdateParticipationCommandHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<UpdateParticipationCommand>
    {
        public async Task Handle(UpdateParticipationCommand request, CancellationToken cancellationToken)
        {
            var participation = await unitOfWork.ParticipationRepository.GetByIdAsync(request.participationId, cancellationToken);
            
            if(participation is null) throw new NotFoundException("Participation not found");

            participation.Status = request.dto.Status;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
