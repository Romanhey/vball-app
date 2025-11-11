using FluentValidation;

namespace Schedule.Application.Validators.Participation
{
    public class ReviewParticipationCommandValidator : AbstractValidator<Application.UseCases.Participation.ReviewParticipation.ReviewParticipationCommand>
    {
        public ReviewParticipationCommandValidator()
        {
            RuleFor(x => x.ParticipationId)
                .GreaterThan(0)
                .WithMessage("ParticipationId must be greater than 0");
        }
    }
}
