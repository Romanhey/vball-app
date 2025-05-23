using AutoMapper;
using Identity.Application.UseCases.Commands;
using Identity.Domain.Entities;
using Identity.Domain.IRepository;
using Identity.Domain.IServices;
using MediatR;
using System.Net.Security;

namespace Identity.Application.UseCases.ComandsHandler
{
    public class RegisterUserCommandHandler(
        IUnitOfWork uow,
        IPasswordHasher pswH
        ) : IRequestHandler<RegisterUserCommand>
    {
        public async Task Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            if( await uow.UserRepository.GetByEmail(request.DTO.Email) is not null)
            {
                throw new Exception("User already exist");
            }

            User user = new User();
            user.Email = request.DTO.Email;
            user.Name = request.DTO.Name;
            user.Password = pswH.HashPassword(request.DTO.Password);
            await uow.UserRepository.AddAsync(user);
        }
    }
}
