using AutoMapper;
using Identity.Application.DTO;
using Identity.Domain.IRepository;
using MediatR;
using System.Collections.Generic;

namespace Identity.Application.UseCases.Queries.GetUserById
{
    public class GetUserByIdQueryHandler(
        IUnitOfWork unitOfWork,
        IMapper mapper) : IRequestHandler<GetUserByIdQuery, UserProfileDTO>
    {
        public async Task<UserProfileDTO> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
        {
            var user = await unitOfWork.UserRepository.GetByIdAsync(request.UserId);
            if (user is null)
            {
                throw new KeyNotFoundException("User not found");
            }

            return mapper.Map<UserProfileDTO>(user);
        }
    }
}

