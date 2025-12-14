using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Match.UpdateMatch
{
    public class FinishMatchCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<FinishMatchCommand>
    {
        public async Task Handle(FinishMatchCommand request, CancellationToken cancellationToken)
        {
            var match = await unitOfWork.MatchRepository.GetByIdAsync(request.MatchId, cancellationToken);

            // Validation ensures match exists, but keep null check for safety
            if (match is null) return;

            // Business rule: only matches in progress can be finished
            if (match.Status != MatchStatus.InProgress)
            {
                throw new BadRequestException("Only a match in progress can be finished");
            }

            match.Status = MatchStatus.Finished;
            match.FinalScore = request.FinalScore;

            await unitOfWork.MatchRepository.UpdateAsync(match, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
