using FluentValidation;

namespace Schedule.Application.Validators.Participation
{
    public class ReviewWaitlistedParticipationCommandValidator : AbstractValidator<Application.UseCases.Participation.ReviewWaitlistedParticipation.ReviewWaitlistedParticipationCommand>
    {
        public ReviewWaitlistedParticipationCommandValidator()
        {
            RuleFor(x => x.ParticipationId)
                .GreaterThan(0)
                .WithMessage("ParticipationId must be greater than 0");
        }
    }
}
