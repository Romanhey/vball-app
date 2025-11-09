using AutoMapper;
using MediatR;
using Schedule.Domain.Entities;
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
            var newMatch = mapper.Map<Domain.Entities.Match>(request.MatchDTO);
            newMatch.Status = MatchStatus.Scheduled;

            await unitOfWork.MatchRepository.AddAsync(newMatch, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
