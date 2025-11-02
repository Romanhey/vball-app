using AutoMapper;
using MediatR;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Match.CreateMatch
{
    public class CreateMatchCommandHandler(
        IMapper mapper,
        IUnitOfWork unitOfWork
        ) : IRequestHandler<CreateMatchCommand>
    {
        public async Task Handle(CreateMatchCommand request, CancellationToken cancellationToken)
        {
            await unitOfWork.MatchRepository.AddAsync(mapper.Map<Domain.Entities.Match>(request), cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
