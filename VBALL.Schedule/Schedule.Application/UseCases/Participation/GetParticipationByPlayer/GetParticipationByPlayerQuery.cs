using MediatR;
using Schedule.Application.DTO.Participation;

namespace Schedule.Application.UseCases.Participation.GetParticipationByPlayer;

public record GetParticipationByPlayerQuery(int PlayerId) : IRequest<List<ParticipationResponseDTO>>;
