using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Match.DeleteMatch
{
    public class DeleteMatchCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteMatchCommand>
    {
        public async Task Handle(DeleteMatchCommand request, CancellationToken cancellationToken)
        {
            var match = await unitOfWork.MatchRepository.GetByIdAsync(request.Id, cancellationToken);
            if (match is null) throw new NotFoundException("Match not found");

            await unitOfWork.MatchRepository.DeleteAsync(match, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
