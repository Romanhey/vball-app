using MediatR;
using Schedule.Application.Behaviors;

namespace Schedule.Application.UseCases.Participation.ApproveParticipation;

public record ApproveParticipationCommand(int ParticipationId) : IRequest, IParticipationCommand;
