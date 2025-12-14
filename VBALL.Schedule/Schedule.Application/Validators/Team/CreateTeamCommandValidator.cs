using FluentValidation;
using Schedule.Application.UseCases.Team.CreateTeam;

namespace Schedule.Application.Validators.Team
{
    public class CreateTeamCommandValidator : AbstractValidator<CreateTeamCommand>
    {
        public CreateTeamCommandValidator()
        {
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
        }
    }
}
