using FluentValidation;
using Schedule.Application.UseCases.Participation.RejectCancellation;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.Validators.Participation
{
    public class RejectCancellationCommandValidator : AbstractValidator<RejectCancellationCommand>
    {
        private readonly IUnitOfWork _unitOfWork;

        public RejectCancellationCommandValidator(IUnitOfWork unitOfWork)
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
