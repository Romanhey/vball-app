using MediatR;

namespace Schedule.Application.UseCases.Participation.ApproveParticipation;

public record ApproveParticipationCommand(int ParticipationId) : IRequest;
