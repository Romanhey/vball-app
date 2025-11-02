using MediatR;

namespace Schedule.Application.UseCases.Match.DeleteMatch
{
    public record DeleteMatchCommand(int Id):IRequest;
}
