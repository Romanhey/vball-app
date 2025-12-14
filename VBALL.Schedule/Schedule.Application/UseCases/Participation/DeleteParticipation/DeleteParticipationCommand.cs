using MediatR;

namespace Schedule.Application.UseCases.Participation.DeleteParticipation
{
    public record DeleteParticipationCommand(int participationId):IRequest;
}
