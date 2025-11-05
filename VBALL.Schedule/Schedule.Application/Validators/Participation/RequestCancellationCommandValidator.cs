using FluentValidation;
using Schedule.Application.UseCases.Participation.RequestCancellation;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Validators.Participation
{
    public class RequestCancellationCommandValidator : AbstractValidator<RequestCancellationCommand>
    {
        private readonly IUnitOfWork _unitOfWork;

        public RequestCancellationCommandValidator(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;

            RuleFor(x => x.ParticipationId)
                .GreaterThan(0)
                .WithMessage("ParticipationId must be greater than 0");

            RuleFor(x => x.Dto.Reason)
                .NotEmpty()
                .WithMessage("Cancellation reason is required")
                .MaximumLength(500)
                .WithMessage("Cancellation reason must not exceed 500 characters");

            RuleFor(x => x.ParticipationId)
                .MustAsync(ParticipationExists)
                .WithMessage("Participation does not exist");
        }

        private async Task<bool> ParticipationExists(int participationId, CancellationToken cancellationToken)
        {
            var participation = await _unitOfWork.ParticipationRepository.GetByIdAsync(participationId, cancellationToken);
            return participation is not null;
        }
    }
}
