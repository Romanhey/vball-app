using FluentValidation;
using Identity.Application.DTO;

namespace Identity.Application.UseCases.Commands.LoginUser
{
    public class LoginUserCommandValidation: AbstractValidator<LoginUserCommand>
    {
        public LoginUserCommandValidation() 
        {
            RuleFor(x => x.DTO.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format");
        }
    }
}
