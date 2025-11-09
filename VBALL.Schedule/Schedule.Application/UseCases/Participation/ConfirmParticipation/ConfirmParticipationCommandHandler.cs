using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.ConfirmParticipation;

public class ConfirmParticipationCommandHandler(
    IUnitOfWork unitOfWork
    ) : IRequestHandler<ConfirmParticipationCommand>
{
    public async Task Handle(ConfirmParticipationCommand request, CancellationToken cancellationToken)
    {
        var participation = await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken);

        if (participation is null) return;

        if (participation.Status != ParticipationStatus.Registered)
        {
            throw new BadRequestException("Only participation with Registered status can be confirmed");
        }

        participation.Status = ParticipationStatus.Confirmed;
        participation.UpdatedAt = DateTime.UtcNow;

        await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
