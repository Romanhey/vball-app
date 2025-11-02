using MediatR;

namespace Schedule.Application.UseCases.Participation.GetAllParticipation
{
    public record GetAllParticipationQuery() : IRequest<List<Domain.Entities.Participation>>;
}
