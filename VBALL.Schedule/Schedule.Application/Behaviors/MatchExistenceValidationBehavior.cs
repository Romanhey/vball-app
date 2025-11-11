using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Behaviors
{
    /// <summary>
    /// Pipeline behavior that validates match existence for commands implementing IMatchCommand.
    /// Throws NotFoundException if match does not exist.
    /// </summary>
    public class MatchExistenceValidationBehavior<TRequest, TResponse>(IUnitOfWork unitOfWork)
        : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            if (request is IMatchCommand matchCommand)
            {
                var match = await unitOfWork.MatchRepository
                    .GetByIdAsync(matchCommand.MatchId, cancellationToken);

                if (match is null)
                {
                    throw new NotFoundException("Match not found");
                }
            }

            return await next();
        }
    }
}
