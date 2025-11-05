using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.ApproveParticipation;

public class ApproveParticipationCommandHandler(
    IUnitOfWork unitOfWork
    ) : IRequestHandler<ApproveParticipationCommand>
{
    public async Task Handle(ApproveParticipationCommand request, CancellationToken cancellationToken)
    {
        var participation = await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken);

        // Validation ensures participation exists, but keep null check for safety
        if (participation is null) return;

        // Business rule: can only approve participation with Reviewed status
        if (participation.Status != ParticipationStatus.Reviewed)
        {
            throw new BadRequestException("Only participation with Reviewed status can be approved");
        }

        participation.Status = ParticipationStatus.Registered;
        participation.UpdatedAt = DateTime.UtcNow;

        await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
