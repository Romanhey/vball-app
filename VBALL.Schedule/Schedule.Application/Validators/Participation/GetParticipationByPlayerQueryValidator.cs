using FluentValidation;
using Schedule.Application.UseCases.Participation.GetParticipationByPlayer;

namespace Schedule.Application.Validators.Participation;

public class GetParticipationByPlayerQueryValidator : AbstractValidator<GetParticipationByPlayerQuery>
{
    public GetParticipationByPlayerQueryValidator()
    {
        RuleFor(x => x.PlayerId)
            .GreaterThan(0)
            .WithMessage("PlayerId must be greater than 0");
    }
}
