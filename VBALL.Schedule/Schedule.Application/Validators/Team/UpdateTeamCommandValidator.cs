using FluentValidation;
using Schedule.Application.UseCases.Team.UpdateTeam;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Validators.Team
{
    public class UpdateTeamCommandValidator : AbstractValidator<UpdateTeamCommand>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateTeamCommandValidator(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;

            RuleFor(x => x.TeamId)
                .GreaterThan(0)
                .WithMessage("TeamId must be greater than 0");

            RuleFor(x => x.Dto.Name)
                .NotEmpty()
                .WithMessage("Team name is required")
                .MaximumLength(100)
                .WithMessage("Team name must not exceed 100 characters");

            RuleFor(x => x.Dto.Rating)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Rating must be at least 0")
                .LessThanOrEqualTo(10)
                .WithMessage("Rating must not exceed 10");

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
