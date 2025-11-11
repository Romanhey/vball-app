using MediatR;
using Schedule.Application.Behaviors;

namespace Schedule.Application.UseCases.Participation.ConfirmParticipation;

public record ConfirmParticipationCommand(int ParticipationId, int TeamId) : IRequest, IParticipationCommand;
