using Identity.Application.DTO;
using MediatR;
using System.Collections.Generic;

namespace Identity.Application.UseCases.Queries.GetUsersByIds
{
    public record GetUsersByIdsQuery(IReadOnlyCollection<int> Ids) : IRequest<IEnumerable<UserProfileDTO>>;
}

