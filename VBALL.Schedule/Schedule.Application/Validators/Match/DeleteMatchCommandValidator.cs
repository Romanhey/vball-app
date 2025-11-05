using FluentValidation;
using Schedule.Application.UseCases.Match.DeleteMatch;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Validators.Match;

public class DeleteMatchCommandValidator : AbstractValidator<DeleteMatchCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeleteMatchCommandValidator(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;

        RuleFor(x => x.Id)
            .GreaterThan(0)
            .WithMessage("MatchId must be greater than 0");

        RuleFor(x => x.Id)
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
