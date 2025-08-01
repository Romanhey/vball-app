using Identity.Domain.Entities;
using Identity.Domain.IRepository;
using Identity.Domain.IServices;
using Identity.Domain.Models;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace Identity.Application.UseCases.Commands.RefreshAccessToken
{
    public class RefreshAccessTokenCommandHandler(
        IUnitOfWork uow,
        IHttpContextAccessor contextAccessor,
        ICookieService cookieService,
        IJwtService jwtService
        ) : IRequestHandler<RefreshAccessTokenComand, string>
    {
        public async Task<string> Handle(RefreshAccessTokenComand request, CancellationToken cancellationToken)
        {
            var claim = contextAccessor.HttpContext?.User?.FindFirst("uid")?.Value;
            if (!int.TryParse(claim, out var userId))
                throw new UnauthorizedAccessException("Invalid token");

            var user = await uow.UserRepository.GetByIdAsync(userId);
            if (user is null) throw new UnauthorizedAccessException("User not found.");

            var cookie = cookieService.GetRequestCookie("refreshToken")?? throw new UnauthorizedAccessException("Refresj token is missing");
            var refreshToken = JsonSerializer.Deserialize<RefreshTokenModel>(cookie)!;

            if (refreshToken.RefreshTokenExpireDate < DateTime.UtcNow) throw new UnauthorizedAccessException("Token has expired.");

            return jwtService.GenerateJwtToken(user);
        }
    }
}
