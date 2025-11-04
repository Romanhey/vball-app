using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Match.UpdateMatch
{
    public class RescheduleMatchCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<RescheduleMatchCommand>
    {
        public async Task Handle(RescheduleMatchCommand request, CancellationToken cancellationToken)
        {
            var match = await unitOfWork.MatchRepository.GetByIdAsync(request.MatchId, cancellationToken);
            if (match is null)
            {
                throw new NotFoundException("Match not found.");
            }

            if (match.Status != MatchStatus.Scheduled)
            {
                throw new BadRequestException("Only a scheduled match can be rescheduled.");
            }

            if (request.NewStartTime <= DateTime.UtcNow)
            {
                throw new BadRequestException("A match cannot be rescheduled to the past.");
            }

            match.StartTime = request.NewStartTime;

            await unitOfWork.MatchRepository.UpdateAsync(match, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
