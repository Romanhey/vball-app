using FluentValidation;
using Schedule.Application.UseCases.Participation.CreateParticipation;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Validators.Participation;

public class CreateParticipationCommandValidator : AbstractValidator<CreateParticipationCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateParticipationCommandValidator(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;

        RuleFor(x => x.ParticipationDTO.MatchId)
            .GreaterThan(0)
            .WithMessage("MatchId must be greater than 0");

        RuleFor(x => x.ParticipationDTO.PlayerId)
            .GreaterThan(0)
            .WithMessage("PlayerId must be greater than 0");

        RuleFor(x => x.ParticipationDTO)
            .MustAsync(MatchMustExist)
            .WithMessage("Match not found")
            .MustAsync(PlayerNotAlreadyRegistered)
            .WithMessage("Player is already registered for this match");
    }

    private async Task<bool> MatchMustExist(
        Schedule.Application.DTO.Participation.CreateParticipationDTO dto,
        CancellationToken cancellationToken)
    {
        var match = await _unitOfWork.MatchRepository.GetByIdAsync(dto.MatchId, cancellationToken);
        return match != null;
    }

    private async Task<bool> PlayerNotAlreadyRegistered(
        Schedule.Application.DTO.Participation.CreateParticipationDTO dto,
        CancellationToken cancellationToken)
    {
        var existingParticipation = await _unitOfWork.ParticipationRepository
            .GetByMatchAndPlayerAsync(dto.MatchId, dto.PlayerId, cancellationToken);
        return existingParticipation == null;
    }
}
