using AutoMapper;
using MediatR;
using Schedule.Application.Exeptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Team.UpdateTeam
{
    public class UpdateTeamCommandHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<UpdateTeamCommand>
    {
        public async Task Handle(UpdateTeamCommand request, CancellationToken cancellationToken)
        {
            var team = await unitOfWork.TeamRepository.GetByIdAsync(request.teamId, cancellationToken);

            if (team is null) throw new NotFoundException("Team not found");

            team.Name = request.dto.Name;

            await unitOfWork.TeamRepository.UpdateAsync(team);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
