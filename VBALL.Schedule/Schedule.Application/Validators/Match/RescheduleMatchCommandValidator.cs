using FluentValidation;
using Schedule.Application.UseCases.Match.UpdateMatch;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Validators.Match;

public class RescheduleMatchCommandValidator : AbstractValidator<RescheduleMatchCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public RescheduleMatchCommandValidator(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;

        RuleFor(x => x.MatchId)
            .GreaterThan(0)
            .WithMessage("MatchId must be greater than 0");

        RuleFor(x => x.NewStartTime)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("A match cannot be rescheduled to the past");

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
