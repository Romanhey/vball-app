using MediatR;
using Schedule.Application.DTO.Match;

namespace Schedule.Application.UseCases.Match.UpdateMatch
{
    public record UpdateMatchCommand(int Id, UpdateMatchDTO Dto): IRequest;
}
