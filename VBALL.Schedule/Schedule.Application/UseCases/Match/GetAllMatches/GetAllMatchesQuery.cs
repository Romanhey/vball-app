using MediatR;
using Schedule.Application.DTO.Match;

namespace Schedule.Application.UseCases.Match.GetAllMatches
{
    public record GetAllMatchesQuery(MatchFilterDTO DTO, int skip, int take): IRequest<List<Domain.Entities.Match>>;
}
