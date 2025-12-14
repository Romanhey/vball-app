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

            var exists = await unitOfWork.TeamRepository.GetAsync<Domain.Entities.Team>(t => t.Name == request.Dto.Name && t.TeamId != request.TeamId, cancellationToken: cancellationToken);
            if (exists.Any())
                throw new AlreadyExistException($"Team with name '{request.Dto.Name}' already exists");

            team.Name = request.Dto.Name;
            team.Rating = request.Dto.Rating;

            await unitOfWork.TeamRepository.UpdateAsync(team, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
