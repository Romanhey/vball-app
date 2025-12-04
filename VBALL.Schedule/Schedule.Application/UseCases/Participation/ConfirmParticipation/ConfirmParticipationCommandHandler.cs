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
        var participation = (await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken))!;

        if (participation.Status != ParticipationStatus.Registered)
        {
            throw new BadRequestException("Only participation with Registered status can be confirmed");
        }
        
        var match = await unitOfWork.MatchRepository.GetByIdAsync(participation.MatchId, cancellationToken);
        if (match is null)
        {
            throw new NotFoundException($"Match with ID {participation.MatchId} not found");
        }

        if (match.TeamAId != request.TeamId && match.TeamBId != request.TeamId)
        {
            throw new BadRequestException("Team does not belong to this match");
        }

        var matchParticipation = await unitOfWork.ParticipationRepository.GetByMatchAsync(participation.MatchId, cancellationToken);
        var teamPlayersCount = matchParticipation.Count(p =>
            p.TeamId == request.TeamId &&
            p.Status == ParticipationStatus.Confirmed);

        if (teamPlayersCount >= 7)
        {
            throw new BadRequestException("Team already has 7 players for this match");
        }

        participation.TeamId = request.TeamId;
        participation.Status = ParticipationStatus.Confirmed;
        participation.UpdatedAt = DateTime.UtcNow;

        await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
