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
        // Note: Participation existence and match finished validation is handled by FinishedMatchValidationBehavior
        var participation = (await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken))!;

        // Business rule: can only confirm from Registered status
        if (participation.Status != ParticipationStatus.Registered)
        {
            throw new BadRequestException("Only participation with Registered status can be confirmed");
        }

        // Business rule: team must exist and belong to this match
        var team = await unitOfWork.TeamRepository.GetByIdAsync(request.TeamId, cancellationToken);
        if (team is null)
        {
            throw new NotFoundException($"Team with ID {request.TeamId} not found");
        }

        var match = await unitOfWork.MatchRepository.GetByIdAsync(participation.MatchId, cancellationToken);
        if (match is null)
        {
            throw new NotFoundException($"Match with ID {participation.MatchId} not found");
        }

        // Note: Match finished validation is handled by FinishedMatchValidationBehavior

        if (match.TeamAId != request.TeamId && match.TeamBId != request.TeamId)
        {
            throw new BadRequestException("Team does not belong to this match");
        }

        // Business rule: team cannot have more than 7 players
        var matchParticipations = await unitOfWork.ParticipationRepository.GetByMatchAsync(participation.MatchId, cancellationToken);
        var teamPlayersCount = matchParticipations.Count(p =>
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
