using MediatR;

namespace Schedule.Application.UseCases.Match.UpdateMatch
{
    public record FinishMatchCommand(int MatchId, string FinalScore) : IRequest;
}
