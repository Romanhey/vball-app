using AutoMapper;
using FluentValidation;
using Identity.Domain.Entities;
using Identity.Domain.IRepository;
using Identity.Domain.IServices;
using MediatR;

namespace Identity.Application.UseCases.Commands.RegisterUser
{
    public class RegisterUserCommandHandler(
        IMapper mapper,
        IUnitOfWork uow,
        IPasswordHasher pswH,
        IValidator<RegisterUserCommand> commandValidator
        ) : IRequestHandler<RegisterUserCommand>
    {
        public async Task Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            var validateResult = await commandValidator.ValidateAsync(request, cancellationToken);

            if (!validateResult.IsValid)
            {
                throw new Exception(validateResult.ToString());
            }

            if (await uow.UserRepository.GetByEmailAsync(request.DTO.Email) is not null)
            {
                throw new DuplicateWaitObjectException("User already exist");
            }

            await uow.UserRepository.AddAsync(mapper.Map<User>(request.DTO, opt => opt.Items["PasswordHasher"] = pswH));
            await uow.CompleteAsync();
        }
    }
}
