using Identity.Application.DTO;
using MediatR;

namespace Identity.Application.UseCases.Queries.GetUserById
{
    public record GetUserByIdQuery(int UserId) : IRequest<UserProfileDTO>;
}

