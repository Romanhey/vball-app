using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Behaviors
{
    /// <summary>
    /// Pipeline behavior that validates team existence for commands implementing ITeamCommand.
    /// Throws NotFoundException if team does not exist.
    /// </summary>
    public class TeamExistenceValidationBehavior<TRequest, TResponse>(IUnitOfWork unitOfWork)
        : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            if (request is ITeamCommand teamCommand)
            {
                var team = await unitOfWork.TeamRepository
                    .GetByIdAsync(teamCommand.TeamId, cancellationToken);

                if (team is null)
                {
                    throw new NotFoundException("Team not found");
                }
            }

            return await next();
        }
    }
}
