using Identity.Application.DTO;
using MediatR;

namespace Identity.Application.UseCases.Commands
{
    public class RegisterUserCommand(RegisterDTO dto):IRequest
    {
        public RegisterDTO DTO { get; set; } = dto;
    }
}
