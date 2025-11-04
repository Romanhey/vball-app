using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Match.UpdateMatch
{
    public class StartMatchCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<StartMatchCommand>
    {
        public async Task Handle(StartMatchCommand request, CancellationToken cancellationToken)
        {
            var match = await unitOfWork.MatchRepository.GetByIdAsync(request.MatchId, cancellationToken);
            if (match is null)
            {
                throw new NotFoundException("Match not found.");
            }

            if (match.Status != MatchStatus.Scheduled)
            {
                throw new BadRequestException("Only a scheduled match can be started.");
            }

            match.Status = MatchStatus.InProgress;

            await unitOfWork.MatchRepository.UpdateAsync(match, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
