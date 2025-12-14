using MediatR;
using Schedule.Application.DTO.Participation;

namespace Schedule.Application.UseCases.Participation.GetAllParticipations
{
    public record GetAllParticipationsQuery(): IRequest<List<Domain.Entities.Participation>>;
}
