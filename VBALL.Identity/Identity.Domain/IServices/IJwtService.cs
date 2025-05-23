using Identity.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Identity.Domain.IServices
{
    public interface IJwtService
    {
        string GetJwt(User user);
        string GetRefreshToken(User user);
        ClaimsPrincipal GetTokenPrincipal(string JwtToken);
    }
}
