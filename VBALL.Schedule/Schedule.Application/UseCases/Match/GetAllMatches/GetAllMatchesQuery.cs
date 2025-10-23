using MediatR;

namespace Schedule.Application.UseCases.Match.GetAllMatches
{
    public record GetAllMatchesQuery: IRequest<List<Domain.Entities.Match>>;
}
