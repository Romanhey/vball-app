using AutoMapper;
using MediatR;
using Schedule.Domain.IRepositories;
using Schedule.Application.Exceptions;

namespace Schedule.Application.UseCases.Team.CreateTeam
{
    public class CreateTeamCommandHandler(
        IMapper mapper,
        IUnitOfWork unitOfWork
        ) : IRequestHandler<CreateTeamCommand>
    {
        public async Task Handle(CreateTeamCommand request, CancellationToken cancellationToken)
        {
            var exists = await unitOfWork.TeamRepository.GetAsync<Domain.Entities.Team>(t => t.Name == request.Dto.Name, cancellationToken: cancellationToken);
            if (exists.Any())
                throw new AlreadyExistException($"Team with name '{request.Dto.Name}' already exists");

            await unitOfWork.TeamRepository.AddAsync(mapper.Map<Domain.Entities.Team>(request), cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
