using MediatR;

namespace Schedule.Application.UseCases.Match.GetMatch
{
    public record GetMatchQuery(int Id):IRequest<Domain.Entities.Match>;
}
