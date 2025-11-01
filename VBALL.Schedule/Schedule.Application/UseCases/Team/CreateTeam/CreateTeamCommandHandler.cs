using AutoMapper;
using MediatR;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Team.CreateTeam
{
    public class CreateTeamCommandHandler(
        IMapper mapper,
        IUnitOfWork unitOfWork
        ) : IRequestHandler<CreateTeamCommand>
    {
        public async Task Handle(CreateTeamCommand request, CancellationToken cancellationToken)
        {
            await unitOfWork.TeamRepository.AddAsync(mapper.Map<Domain.Entities.Team>(request), cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
