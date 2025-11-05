using FluentValidation;
using Schedule.Application.UseCases.Team.GetTeamPlayers;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Validators.Team
{
    public class GetTeamPlayersQueryValidator : AbstractValidator<GetTeamPlayersQuery>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetTeamPlayersQueryValidator(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;

            RuleFor(x => x.TeamId)
                .GreaterThan(0)
                .WithMessage("TeamId must be greater than 0");

            RuleFor(x => x.TeamId)
                .MustAsync(TeamExists)
                .WithMessage("Team does not exist");
        }

        private async Task<bool> TeamExists(int teamId, CancellationToken cancellationToken)
        {
            var team = await _unitOfWork.TeamRepository.GetByIdAsync(teamId, cancellationToken);
            return team is not null;
        }
    }
}
