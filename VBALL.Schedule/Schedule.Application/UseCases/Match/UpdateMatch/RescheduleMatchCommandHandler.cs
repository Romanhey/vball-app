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

            // Validation ensures match exists, but keep null check for safety
            if (match is null) return;

            // Business rule: only scheduled matches can be rescheduled
            if (match.Status != MatchStatus.Scheduled)
            {
                throw new BadRequestException("Only a scheduled match can be rescheduled");
            }

            match.StartTime = request.NewStartTime;

            await unitOfWork.MatchRepository.UpdateAsync(match, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
