using MediatR;
using Schedule.Application.DTO.Match;

namespace Schedule.Application.UseCases.Match
{
    public record CreateMatchCommand(CreateMatchDTO matchDTO) : IRequest;
}
