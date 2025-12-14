using MediatR;

namespace Schedule.Application.UseCases.Match.UpdateMatch
{
    public record StartMatchCommand(int MatchId) : IRequest;
}
