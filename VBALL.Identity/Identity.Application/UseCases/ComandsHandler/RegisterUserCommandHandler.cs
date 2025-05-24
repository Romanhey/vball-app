using AutoMapper;
using Identity.Application.UseCases.Commands;
using Identity.Domain.Entities;
using Identity.Domain.IRepository;
using Identity.Domain.IServices;
using MediatR;
using Microsoft.Extensions.Configuration;

namespace Identity.Application.UseCases.ComandsHandler
{
    public class RegisterUserCommandHandler(
        IMapper mapper,
        IUnitOfWork uow,
        IPasswordHasher pswH,
        IJwtService jwtService, 
        IConfiguration config
        ) : IRequestHandler<RegisterUserCommand>
    {
        public async Task Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            if( await uow.UserRepository.GetByEmail(request.DTO.Email) is not null)
            {
                throw new Exception("User already exist");
            }

            
            await uow.UserRepository.AddAsync(mapper.Map<User>(request.DTO , opt => opt.Items["PasswordHasher"] = pswH));
            await uow.CompleteAsync();
        }
    }
}
