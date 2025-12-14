using FluentValidation;
using Schedule.Application.UseCases.Participation.UpdateParticipation;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Validators.Participation;

public class UpdateParticipationCommandValidator : AbstractValidator<UpdateParticipationCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateParticipationCommandValidator(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;

        RuleFor(x => x.ParticipationId)
            .GreaterThan(0)
            .WithMessage("ParticipationId must be greater than 0");

        RuleFor(x => x.Dto.Status)
            .IsInEnum()
            .WithMessage("Invalid participation status");

        RuleFor(x => x)
            .MustAsync(ParticipationMustExist)
            .WithMessage("Participation not found")
            .MustAsync(StatusTransitionIsValid)
            .WithMessage("Invalid status transition. Current status does not allow changing to the requested status");
    }

    private async Task<bool> ParticipationMustExist(
        UpdateParticipationCommand command,
        CancellationToken cancellationToken)
    {
        var participation = await _unitOfWork.ParticipationRepository
            .GetByIdAsync(command.ParticipationId, cancellationToken);
        return participation != null;
    }

    private async Task<bool> StatusTransitionIsValid(
        UpdateParticipationCommand command,
        CancellationToken cancellationToken)
    {
        var participation = await _unitOfWork.ParticipationRepository
            .GetByIdAsync(command.ParticipationId, cancellationToken);

        if (participation == null)
        {
            return true; // Will be caught by ParticipationMustExist
        }

        var currentStatus = participation.Status;
        var newStatus = command.Dto.Status;

        // If status hasn't changed, it's valid
        if (currentStatus == newStatus)
        {
            return true;
        }

        // Define valid transitions
        return currentStatus switch
        {
            ParticipationStatus.Applied => newStatus is ParticipationStatus.Reviewed
                or ParticipationStatus.Cancelled,

            ParticipationStatus.Reviewed => newStatus is ParticipationStatus.Registered
                or ParticipationStatus.Waitlisted
                or ParticipationStatus.Cancelled,

            ParticipationStatus.Registered => newStatus is ParticipationStatus.Confirmed
                or ParticipationStatus.PendingCancellation
                or ParticipationStatus.Cancelled,

            ParticipationStatus.Waitlisted => newStatus is ParticipationStatus.Registered
                or ParticipationStatus.Cancelled,

            ParticipationStatus.Confirmed => newStatus is ParticipationStatus.PendingCancellation
                or ParticipationStatus.Cancelled,

            ParticipationStatus.PendingCancellation => newStatus is ParticipationStatus.Cancelled
                or ParticipationStatus.Confirmed
                or ParticipationStatus.Registered, // Admin can reject cancellation request

            ParticipationStatus.Cancelled => false, // Cancelled is final state

            _ => false
        };
    }
}
