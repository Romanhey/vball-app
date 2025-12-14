using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Match.DeleteMatch
{
    public class DeleteMatchCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteMatchCommand>
    {
        public async Task Handle(DeleteMatchCommand request, CancellationToken cancellationToken)
        {
            var match = await unitOfWork.MatchRepository.GetByIdAsync(request.Id, cancellationToken);

            // Validation ensures match exists, but keep null check for safety
            if (match is null) return;

            // Business rule: cannot delete matches that are in progress or finished
            if (match.Status == MatchStatus.InProgress)
            {
                throw new BadRequestException("Cannot delete a match that is in progress");
            }

            if (match.Status == MatchStatus.Finished)
            {
                throw new BadRequestException("Cannot delete a finished match");
            }

            await unitOfWork.MatchRepository.DeleteAsync(match, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
