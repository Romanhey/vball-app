using FluentValidation;
using Schedule.Application.UseCases.Participation.ConfirmParticipation;

namespace Schedule.Application.Validators.Participation;

public class ConfirmParticipationCommandValidator : AbstractValidator<ConfirmParticipationCommand>
{
    public ConfirmParticipationCommandValidator()
    {
        RuleFor(x => x.ParticipationId)
            .GreaterThan(0)
            .WithMessage("ParticipationId must be greater than 0");

        RuleFor(x => x.TeamId)
            .GreaterThan(0)
            .WithMessage("TeamId must be greater than 0");
    }
}
