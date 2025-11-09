using FluentValidation;
using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.RequestCancellation
{
    public class RequestCancellationCommandHandler(
        IUnitOfWork unitOfWork,
        IValidator<RequestCancellationCommand> validator
        ) : IRequestHandler<RequestCancellationCommand>
    {
        public async Task Handle(RequestCancellationCommand request, CancellationToken cancellationToken)
        {
            var res = await validator.ValidateAsync(request, cancellationToken);

            if (!res.IsValid)
            {
                throw new BadRequestException(string.Join(',', res.Errors));
            }

            var participation = await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken);

            if (participation is null)
            {
                throw new NotFoundException("Participation not found");
            }

            if (participation.Status != ParticipationStatus.Confirmed &&
                participation.Status != ParticipationStatus.Registered)
            {
                throw new BadRequestException("Can only request cancellation for confirmed or registered participation");
            }

    

            if (participation.Status == ParticipationStatus.PendingCancellation)
            {
                throw new BadRequestException("Cancellation request already exists");
            }

            participation.Status = ParticipationStatus.PendingCancellation;
            participation.CancellationReason = request.Dto.Reason;
            participation.UpdatedAt = DateTime.UtcNow;

            await unitOfWork.ParticipationRepository.UpdateAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
