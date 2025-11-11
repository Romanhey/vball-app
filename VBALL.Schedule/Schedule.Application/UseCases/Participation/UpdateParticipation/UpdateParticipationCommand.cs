using MediatR;
using Schedule.Application.Behaviors;
using Schedule.Application.DTO.Participation;

namespace Schedule.Application.UseCases.Participation.UpdateParticipation;

public record UpdateParticipationCommand(int ParticipationId, UpdateParticipationDTO Dto) : IRequest, IParticipationCommand;