using MediatR;
using Schedule.Application.DTO.Participation;

namespace Schedule.Application.UseCases.Participation.UpdateParticipation;

public record UpdateParticipationCommand(int participationId, UpdateParticipationDTO dto) : IRequest;