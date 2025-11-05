using MediatR;
using Schedule.Application.DTO.Participation;
using Schedule.Domain.Entities;

namespace Schedule.Application.UseCases.Participation.GetParticipationByStatus;

public record GetParticipationByStatusQuery(ParticipationStatus Status) : IRequest<List<ParticipationResponseDTO>>;
