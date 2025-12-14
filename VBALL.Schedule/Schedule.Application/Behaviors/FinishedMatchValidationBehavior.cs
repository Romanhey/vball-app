using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Behaviors
{
    /// <summary>
    /// Pipeline behavior that validates participation modifications cannot be made after match has finished.
    /// Applies to all commands that implement IParticipationCommand interface.
    /// </summary>
    public class FinishedMatchValidationBehavior<TRequest, TResponse>(IUnitOfWork unitOfWork)
        : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            // Only apply to commands that modify participation
            if (request is IParticipationCommand participationCommand)
            {
                var participation = await unitOfWork.ParticipationRepository
                    .GetByIdAsync(participationCommand.ParticipationId, cancellationToken);

                if (participation is null)
                {
                    throw new NotFoundException("Participation not found");
                }

                var match = await unitOfWork.MatchRepository
                    .GetByIdAsync(participation.MatchId, cancellationToken);

                if (match is null)
                {
                    throw new NotFoundException("Match not found");
                }

                if (match.Status == MatchStatus.Finished)
                {
                    throw new BadRequestException("Cannot modify participation: match has finished");
                }
            }

            return await next();
        }
    }
}
