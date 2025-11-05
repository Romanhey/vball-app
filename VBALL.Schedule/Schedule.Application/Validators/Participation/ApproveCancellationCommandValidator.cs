using FluentValidation;
using Schedule.Application.UseCases.Participation.ApproveCancellation;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Validators.Participation
{
    public class ApproveCancellationCommandValidator : AbstractValidator<ApproveCancellationCommand>
    {
        private readonly IUnitOfWork _unitOfWork;

        public ApproveCancellationCommandValidator(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;

            RuleFor(x => x.ParticipationId)
                .GreaterThan(0)
                .WithMessage("ParticipationId must be greater than 0");

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
