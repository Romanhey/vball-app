using MediatR;

namespace Schedule.Application.UseCases.Match.UpdateMatch
{
    public record RescheduleMatchCommand(int MatchId, DateTime NewStartTime) : IRequest;
}
