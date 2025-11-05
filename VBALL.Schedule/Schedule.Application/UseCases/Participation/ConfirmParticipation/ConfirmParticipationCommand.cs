using MediatR;

namespace Schedule.Application.UseCases.Participation.ConfirmParticipation;

public record ConfirmParticipationCommand(int ParticipationId) : IRequest;
