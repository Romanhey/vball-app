using Identity.Application.DTO;
using MediatR;

namespace Identity.Application.UseCases.Commands.LoginUser
{
    public class LoginUserCommand(LoginDTO dto) : IRequest<LoginUserResponseDTO>
    {
        public LoginDTO DTO { get; } = dto;
    }
}
