using AutoMapper;
using MediatR;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Match.UpdateMatch
{
    public class UpdateMatchCommandHandler(
        IUnitOfWork unitOfWork) : IRequestHandler<UpdateMatchCommand>
    {
        public async Task Handle(UpdateMatchCommand request, CancellationToken cancellationToken)
        {
            var match = await unitOfWork.MatchRepository.GetByIdAsynd(request.id, cancellationToken);
            if (match is null) throw new Exception("Match not found");

            match.StartTime = request.dto.StartTime;
            match.TeamAId = request.dto.TeamAId;
            match.TeamBId = request.dto.TeamBId;
            match.Status = request.dto.MatchStatus;
            match.FinalScore = request.dto.FinalScore;

            await unitOfWork.MatchRepository.UpdateAsync(match);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
