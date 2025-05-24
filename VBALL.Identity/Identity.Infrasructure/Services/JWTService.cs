using Identity.Domain.Entities;
using Identity.Domain.IServices;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Npgsql.Internal;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Identity.Infastucture.Services
{
    public class JWTService(IConfiguration config) : IJwtService
    {
        private readonly IConfigurationSection _jwtSettings = config.GetSection("JwtSettings")!;
        public string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("admin", user.IsAdmin ? "true" : "false")
            };
            var secret = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings["Secret"]!));
            var creds = new SigningCredentials(secret, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings["Issuer"],
                audience: _jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(double.Parse(_jwtSettings["ExpiryMinutes"]!)),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string ValidateToken(string token)
        {
            throw new NotImplementedException();
        }

        /*public string GetRefreshToken(User user)
        {
            throw new NotImplementedException();
        }*/
    }
}
