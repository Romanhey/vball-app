using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Team.DeleteTeam
{
    public class DeleteTeamCommandHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<DeleteTeamCommand>
    {
        public async Task Handle(DeleteTeamCommand request, CancellationToken cancellationToken)
        {
            var team = await unitOfWork.TeamRepository.GetByIdAsync(request.TeamId, cancellationToken);

            if (team is null) throw new NotFoundException("Team not found");

            // Бизнес-правило: нельзя удалить команду с активными матчами
            var hasActiveMatches = await unitOfWork.MatchRepository.HasActiveMatchesForTeamAsync(request.TeamId, cancellationToken);
            if (hasActiveMatches)
            {
                throw new BadRequestException("Cannot delete team with active matches. Please finish or cancel all matches first.");
            }

            await unitOfWork.TeamRepository.DeleteAsync(team, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
