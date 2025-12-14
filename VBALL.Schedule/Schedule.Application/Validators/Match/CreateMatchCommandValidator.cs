using FluentValidation;
using Schedule.Application.UseCases.Match;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Validators.Match;

public class CreateMatchCommandValidator : AbstractValidator<CreateMatchCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateMatchCommandValidator(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;

        RuleFor(x => x.MatchDTO.TeamAId)
            .GreaterThan(0)
            .WithMessage("TeamAId must be greater than 0");

        RuleFor(x => x.MatchDTO.TeamBId)
            .GreaterThan(0)
            .WithMessage("TeamBId must be greater than 0");

        RuleFor(x => x.MatchDTO)
            .Must(dto => dto.TeamAId != dto.TeamBId)
            .WithMessage("A team cannot play against itself");

        RuleFor(x => x.MatchDTO.StartTime)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("A match cannot be scheduled in the past");

        RuleFor(x => x.MatchDTO)
            .MustAsync(BothTeamsMustExist)
            .WithMessage("One or both teams were not found");
    }

    private async Task<bool> BothTeamsMustExist(
        Schedule.Application.DTO.Match.CreateMatchDTO dto,
        CancellationToken cancellationToken)
    {
        var teamA = await _unitOfWork.TeamRepository.GetByIdAsync(dto.TeamAId, cancellationToken);
        var teamB = await _unitOfWork.TeamRepository.GetByIdAsync(dto.TeamBId, cancellationToken);

        return teamA != null && teamB != null;
    }
}
