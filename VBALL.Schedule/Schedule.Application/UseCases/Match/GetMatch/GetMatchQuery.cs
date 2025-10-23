using MediatR;

namespace Schedule.Application.UseCases.Match.GetMatch
{
    public record GetMatchQuery(int id):IRequest<Domain.Entities.Match>;
}
