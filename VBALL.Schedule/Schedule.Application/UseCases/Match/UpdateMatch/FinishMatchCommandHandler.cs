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
            if (match is null)
            {
                throw new NotFoundException("Match not found.");
            }

            if (match.Status != MatchStatus.InProgress)
            {
                throw new BadRequestException("Only a match in progress can be finished.");
            }

            if (string.IsNullOrWhiteSpace(request.FinalScore))
            {
                throw new BadRequestException("Final score cannot be empty.");
            }

            match.Status = MatchStatus.Finished;
            match.FinalScore = request.FinalScore;

            await unitOfWork.MatchRepository.UpdateAsync(match, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
