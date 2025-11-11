using FluentValidation;

namespace Schedule.Application.UseCases.Participation.CreateParticipation
{
    public class CreateParticipationCommandValidator : AbstractValidator<CreateParticipationCommand>
    {
        public CreateParticipationCommandValidator()
        {
            RuleFor(x => x.ParticipationDTO.MatchId)
                .NotEmpty().WithMessage("Match ID is required.");

            RuleFor(x => x.ParticipationDTO.PlayerId)
                .NotEmpty().WithMessage("Player ID is required.");
        }
    }
}
