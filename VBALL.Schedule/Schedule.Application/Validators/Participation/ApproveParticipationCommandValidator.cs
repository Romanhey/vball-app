using FluentValidation;
using Schedule.Application.UseCases.Participation.ApproveParticipation;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Validators.Participation;

public class ApproveParticipationCommandValidator : AbstractValidator<ApproveParticipationCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public ApproveParticipationCommandValidator(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;

        RuleFor(x => x.ParticipationId)
            .GreaterThan(0)
            .WithMessage("ParticipationId must be greater than 0");

        RuleFor(x => x.ParticipationId)
            .MustAsync(ParticipationMustExist)
            .WithMessage("Participation not found");
    }

    private async Task<bool> ParticipationMustExist(
        int participationId,
        CancellationToken cancellationToken)
    {
        var participation = await _unitOfWork.ParticipationRepository
            .GetByIdAsync(participationId, cancellationToken);
        return participation != null;
    }
}
