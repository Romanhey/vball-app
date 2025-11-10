using AutoMapper;
using FluentValidation;
using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.CreateParticipation
{
    public class CreateParticipationCommandHandler(
        IMapper mapper,
        IUnitOfWork unitOfWork,
        IValidator<CreateParticipationCommand> validator
        ) : IRequestHandler<CreateParticipationCommand>
    {
        public async Task Handle(CreateParticipationCommand request, CancellationToken cancellationToken)
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                throw new BadRequestException(string.Join(", ", validationResult.Errors));
            }
            var participation = mapper.Map<Domain.Entities.Participation>(request.ParticipationDTO);
            participation.CreatedAt = DateTime.UtcNow;
            participation.Status = ParticipationStatus.Applied;

            await unitOfWork.ParticipationRepository.AddAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
