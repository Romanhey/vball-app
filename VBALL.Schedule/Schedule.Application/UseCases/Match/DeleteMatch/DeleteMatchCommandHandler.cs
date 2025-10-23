using MediatR;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Match.DeleteMatch
{
    public class DeleteMatchCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteMatchCommand>
    {
        public async Task Handle(DeleteMatchCommand request, CancellationToken cancellationToken)
        {
            var match = await unitOfWork.MatchRepository.GetByIdAsynd(request.id, cancellationToken);
            if (match is null) throw new Exception("Match now found");

            await unitOfWork.MatchRepository.DeleteAsync(match);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
