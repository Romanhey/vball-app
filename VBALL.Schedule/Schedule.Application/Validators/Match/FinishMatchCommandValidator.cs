using FluentValidation;
using Schedule.Application.UseCases.Match.UpdateMatch;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Validators.Match;

public class FinishMatchCommandValidator : AbstractValidator<FinishMatchCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public FinishMatchCommandValidator(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;

        RuleFor(x => x.MatchId)
            .GreaterThan(0)
            .WithMessage("MatchId must be greater than 0");

        RuleFor(x => x.FinalScore)
            .NotEmpty()
            .WithMessage("Final score cannot be empty");

        RuleFor(x => x.MatchId)
            .MustAsync(MatchMustExist)
            .WithMessage("Match not found");
    }

    private async Task<bool> MatchMustExist(
        int matchId,
        CancellationToken cancellationToken)
    {
        var match = await _unitOfWork.MatchRepository.GetByIdAsync(matchId, cancellationToken);
        return match != null;
    }
}
