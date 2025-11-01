using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Match.UpdateMatch
{
    public class UpdateMatchCommandHandler(
        IUnitOfWork unitOfWork) : IRequestHandler<UpdateMatchCommand>
    {
        public async Task Handle(UpdateMatchCommand request, CancellationToken cancellationToken)
        {
            var match = await unitOfWork.MatchRepository.GetByIdAsync(request.Id, cancellationToken);
            if (match is null) throw new NotFoundException("Match not found");

            match.StartTime = request.Dto.StartTime;
            match.TeamAId = request.Dto.TeamAId;
            match.TeamBId = request.Dto.TeamBId;
            match.Status = request.Dto.MatchStatus;
            match.FinalScore = request.Dto.FinalScore;

            await unitOfWork.MatchRepository.UpdateAsync(match, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
