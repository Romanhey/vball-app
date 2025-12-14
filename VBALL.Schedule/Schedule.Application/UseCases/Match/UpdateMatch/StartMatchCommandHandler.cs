using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Constants;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Match.UpdateMatch
{
    public class StartMatchCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<StartMatchCommand>
    {
        public async Task Handle(StartMatchCommand request, CancellationToken cancellationToken)
        {
            var match = await unitOfWork.MatchRepository.GetByIdAsync(request.MatchId, cancellationToken);

            // Validation ensures match exists, but keep null check for safety
            if (match is null) return;

            // Business rule: only scheduled matches can be started
            if (match.Status != MatchStatus.Scheduled)
            {
                throw new BadRequestException("Only a scheduled match can be started");
            }

            // Business rule: match requires exactly 14 confirmed players
            var confirmedCount = await unitOfWork.ParticipationRepository
                .GetActiveParticipationCountForMatchAsync(request.MatchId, cancellationToken);

            if (confirmedCount != ScheduleConstants.MaxPlayersPerMatch)
            {
                throw new BadRequestException($"Cannot start match: requires exactly {ScheduleConstants.MaxPlayersPerMatch} confirmed players, found {confirmedCount}");
            }

            // Business rule: auto-cancel all non-confirmed participations when match starts
            var participations = await unitOfWork.ParticipationRepository.GetByMatchAsync(request.MatchId, cancellationToken);
            var toCancelStatuses = new[] { ParticipationStatus.Applied, ParticipationStatus.Reviewed, ParticipationStatus.Waitlisted };
            var toCancel = participations.Where(p => toCancelStatuses.Contains(p.Status)).ToList();

            foreach (var participation in toCancel)
            {
                participation.Status = ParticipationStatus.Cancelled;
                participation.CancellationType = CancellationType.AdminDecision;
                participation.CancellationReason = "Матч начался";
                participation.UpdatedAt = DateTime.UtcNow;
                await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            }

            match.Status = MatchStatus.InProgress;

            await unitOfWork.MatchRepository.UpdateAsync(match, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
