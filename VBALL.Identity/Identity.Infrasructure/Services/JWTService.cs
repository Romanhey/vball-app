using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Identity.Domain.Entities;
using Identity.Domain.IServices;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Identity.Infrastructure.Services
{
    
    public class JWTService(IConfiguration config):IJwtService   
    {
    private readonly IConfigurationSection _jwtSettings = config.GetSection("Jwt")!;
        public string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim("uid", user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("adm", user.IsAdmin ? "1" : "0")
            };
            var secret = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings["Secret"]!));
            var creds = new SigningCredentials(secret, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddMinutes(double.Parse(_jwtSettings["ExpiryMinutes"]!)),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var bytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);

            return Convert.ToBase64String(bytes);
        }
    }
}
