using AutoMapper;
using MediatR;
using Schedule.Application.Exceptions;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.CreateParticipation
{
    public class CreateParticipationCommandHandler(
        IMapper mapper,
        IUnitOfWork unitOfWork
        ) : IRequestHandler<CreateParticipationCommand>
    {
        public async Task Handle(CreateParticipationCommand request, CancellationToken cancellationToken)
        {
            // Validate match exists
            var match = await unitOfWork.MatchRepository.GetByIdAsync(request.ParticipationDTO.MatchId, cancellationToken);
            if (match == null)
            {
                throw new NotFoundException($"Match with id {request.ParticipationDTO.MatchId} not found");
            }

            // Check for duplicate participation
            var existingParticipation = await unitOfWork.ParticipationRepository.GetByMatchAndPlayerAsync(
                request.ParticipationDTO.MatchId, 
                request.ParticipationDTO.PlayerId, 
                cancellationToken);

            if (existingParticipation != null)
            {
                throw new InvalidOperationException($"Player {request.ParticipationDTO.PlayerId} is already registered for match {request.ParticipationDTO.MatchId}");
            }

            // Create participation entity
            var participation = mapper.Map<Domain.Entities.Participation>(request.ParticipationDTO);
            participation.CreatedAt = DateTime.UtcNow;
            participation.Status = ParticipationStatus.Applied;

            await unitOfWork.ParticipationRepository.AddAsync(participation, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
