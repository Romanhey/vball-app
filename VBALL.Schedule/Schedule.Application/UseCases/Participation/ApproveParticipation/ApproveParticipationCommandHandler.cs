using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Constants;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.ApproveParticipation;

public class ApproveParticipationCommandHandler(
    IUnitOfWork unitOfWork
    ) : IRequestHandler<ApproveParticipationCommand>
{
    public async Task Handle(ApproveParticipationCommand request, CancellationToken cancellationToken)
    {
        var participation = (await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken))!;

        if (participation.Status != ParticipationStatus.Reviewed)
        {
            throw new BadRequestException("Only participation with Reviewed status can be approved");
        }

        var registeredCount = await unitOfWork.ParticipationRepository
            .GetActiveParticipationCountForMatchAsync(participation.MatchId, cancellationToken);

        if (registeredCount >= ScheduleConstants.MaxPlayersPerMatch)
        {
            throw new BadRequestException($"Cannot register: match already has {ScheduleConstants.MaxPlayersPerMatch} registered players");
        }

        participation.Status = ParticipationStatus.Registered;
        participation.UpdatedAt = DateTime.UtcNow;

        await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
