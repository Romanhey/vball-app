using AutoMapper;
using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Team.UpdateTeam
{
    public class UpdateTeamCommandHandler(
        IUnitOfWork unitOfWork
        ) : IRequestHandler<UpdateTeamCommand>
    {
        public async Task Handle(UpdateTeamCommand request, CancellationToken cancellationToken)
        {
            var team = await unitOfWork.TeamRepository.GetByIdAsync(request.TeamId, cancellationToken);

            if (team is null) throw new NotFoundException("Team not found");

            team.Name = request.Dto.Name;
            team.Rating = request.Dto.Raging;

            await unitOfWork.TeamRepository.UpdateAsync(team, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
