using FluentValidation;
using Schedule.Application.UseCases.Participation.AdminCancelParticipation;
using Schedule.Domain.Entities;

namespace Schedule.Application.Validators.Participation
{
    public class AdminCancelParticipationCommandValidator : AbstractValidator<AdminCancelParticipationCommand>
    {
        public AdminCancelParticipationCommandValidator()
        {
            RuleFor(x => x.ParticipationId)
                .GreaterThan(0)
                .WithMessage("ParticipationId must be greater than 0");

            RuleFor(x => x.Dto.CancellationType)
                .IsInEnum()
                .WithMessage("Invalid cancellation type");

            RuleFor(x => x.Dto.Reason)
                .NotEmpty()
                .WithMessage("Cancellation reason is required")
                .MaximumLength(500)
                .WithMessage("Cancellation reason must not exceed 500 characters");
        }
    }
}
