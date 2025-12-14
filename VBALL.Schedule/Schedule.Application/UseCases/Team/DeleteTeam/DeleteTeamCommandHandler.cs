using MediatR;
using Schedule.Application.Exeptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Team.DeleteTeam
{
    public class DeleteTeamCommandHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<DeleteTeamCommand>
    {
        public async Task Handle(DeleteTeamCommand request, CancellationToken cancellationToken)
        {
            var team = await unitOfWork.TeamRepository.GetByIdAsync(request.teamId, cancellationToken);

            if (team is null) throw new NotFoundException();

            await unitOfWork.TeamRepository.DeleteAsync(team, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
