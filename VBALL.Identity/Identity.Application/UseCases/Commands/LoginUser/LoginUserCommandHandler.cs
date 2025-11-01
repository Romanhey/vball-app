using AutoMapper;
using FluentValidation;
using Identity.Application.DTO;
using Identity.Domain.IRepository;
using Identity.Domain.IServices;
using Identity.Domain.Models;
using MediatR;
using Microsoft.Extensions.Configuration;
using System.Security.Authentication;
using System.Text.Json;

namespace Identity.Application.UseCases.Commands.LoginUser
{
    public class LoginUserCommandHandler
        (
        IMapper mapper,
        IJwtService jwtService,
        IUnitOfWork uow,
        IPasswordHasher pswH,
        IValidator<LoginUserCommand> commandValidator,
        ICookieService cookieService,
        IConfiguration configuration
        ) : IRequestHandler<LoginUserCommand, LoginUserResponseDTO>
    {
        public async Task<LoginUserResponseDTO> Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            var validateResult = await commandValidator.ValidateAsync(request, cancellationToken);
            if (!validateResult.IsValid)
            {
                throw new Exception(validateResult.ToString());
            }

            var user = await uow.UserRepository.GetByEmailAsync(request.DTO.Email);

            if (user is null)
            {
                throw new AuthenticationException("User not found");
            }
            if (pswH.HashPassword(request.DTO.Password) != user.Password)
            {
                throw new AuthenticationException("Wrong password");
            }

            var token = jwtService.GenerateJwtToken(user);

            var refreshToken = new RefreshTokenModel
            {
                RefreshToken = jwtService.GenerateRefreshToken(),
                RefreshTokenExpireDate = DateTime.UtcNow.AddDays(configuration.GetValue<int>("JwtSettings:RefreshTokenExpiryDays"))
            };

            var refreshJson = JsonSerializer.Serialize(refreshToken);
            cookieService.AppendResponseCookie("refreshToken", refreshJson);

            var response = mapper.Map<LoginUserResponseDTO>(user);
            response.AccesToken = token;
            
            return response;
        }
    }
}