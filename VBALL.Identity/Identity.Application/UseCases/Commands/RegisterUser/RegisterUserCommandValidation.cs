using FluentValidation;
using Identity.Application.DTO;

namespace Identity.Application.UseCases.Commands.RegisterUser
{
    public class RegisterUserCommandValidation : AbstractValidator<RegisterUserCommand>
    {
        public RegisterUserCommandValidation()
        {
            RuleFor(x => x.DTO.Email)
               .NotEmpty().WithMessage("Email is required.")
               .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.DTO.Name)
                .NotEmpty().WithMessage("Name is required.")
                .Length(2, 50).WithMessage("Name must be between 2 and 50 characters.");

            RuleFor(x => x.DTO.Password)     
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters long.");
            /* .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
             .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
             .Matches("[0-9]").WithMessage("Password must contain at least one number.");*/

            RuleFor(x => x.DTO.PasswordRepeat)
                .NotEmpty().WithMessage("Password confirmation is required.")
                .Equal(x => x.DTO.Password).WithMessage("Passwords do not match.");
        }
    }
}
