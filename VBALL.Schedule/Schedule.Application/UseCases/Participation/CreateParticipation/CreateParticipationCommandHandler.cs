using AutoMapper;
using FluentValidation;
using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Constants;
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

            var dto = request.ParticipationDTO;

            var match = await unitOfWork.MatchRepository.GetByIdAsync(dto.MatchId, cancellationToken);
            if (match is null)
            {
                throw new NotFoundException($"Match with ID {dto.MatchId} not found.");
            }

            if (match.StartTime <= DateTime.UtcNow.AddHours(ScheduleConstants.MinHoursBeforeMatchForParticipation))
            {
                throw new BadRequestException($"Заявки принимаются не позднее чем за {ScheduleConstants.MinHoursBeforeMatchForParticipation} часа до начала матча.");
            }

            var existingParticipation = await unitOfWork.ParticipationRepository.GetByMatchAndPlayerAsync(dto.MatchId, dto.PlayerId, cancellationToken);
            if (existingParticipation is not null && existingParticipation.Status != ParticipationStatus.Cancelled)
            {
                throw new BadRequestException("Player already has an active participation for this match.");
            }

            var activeParticipationCount = await unitOfWork.ParticipationRepository.GetActiveParticipationCountForMatchAsync(dto.MatchId, cancellationToken);

            var participation = mapper.Map<Domain.Entities.Participation>(dto);
            participation.CreatedAt = DateTime.UtcNow;

            if (activeParticipationCount >= ScheduleConstants.MaxPlayersPerMatch)
            {
                participation.Status = ParticipationStatus.Waitlisted;
            }
            else
            {
                participation.Status = ParticipationStatus.Applied;
            }

            await unitOfWork.ParticipationRepository.AddAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
