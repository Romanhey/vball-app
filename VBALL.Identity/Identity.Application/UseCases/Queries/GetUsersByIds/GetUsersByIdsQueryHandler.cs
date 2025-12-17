using AutoMapper;
using Identity.Application.DTO;
using Identity.Domain.IRepository;
using MediatR;
using System.Collections.Generic;
using System.Linq;

namespace Identity.Application.UseCases.Queries.GetUsersByIds;

public class GetUsersByIdsQueryHandler(
    IUnitOfWork unitOfWork,
    IMapper mapper) : IRequestHandler<GetUsersByIdsQuery, IEnumerable<UserProfileDTO>>
{
    public async Task<IEnumerable<UserProfileDTO>> Handle(GetUsersByIdsQuery request, CancellationToken cancellationToken)
    {
        if (request.Ids.Count == 0)
        {
            return Array.Empty<UserProfileDTO>();
        }

        var users = await unitOfWork.UserRepository.GetByIdsAsync(request.Ids);
        return users.Select(mapper.Map<UserProfileDTO>);
    }
}

