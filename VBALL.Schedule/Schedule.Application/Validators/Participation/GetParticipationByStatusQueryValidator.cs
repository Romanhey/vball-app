using FluentValidation;
using Schedule.Application.UseCases.Participation.GetParticipationByStatus;

namespace Schedule.Application.Validators.Participation;

public class GetParticipationByStatusQueryValidator : AbstractValidator<GetParticipationByStatusQuery>
{
    public GetParticipationByStatusQueryValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum()
            .WithMessage("Invalid participation status");
    }
}
