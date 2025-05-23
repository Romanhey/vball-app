using Identity.Domain.Entities;
using Identity.Domain.IServices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Identity.Infastucture.Services
{
    public class JWTService : IJwtService
    {
        public string GetJwt(User user)
        {
            throw new NotImplementedException();
        }

        public string GetRefreshToken(User user)
        {
            throw new NotImplementedException();
        }

        public ClaimsPrincipal GetTokenPrincipal(string JwtToken)
        {
            throw new NotImplementedException();
        }
    }
}
