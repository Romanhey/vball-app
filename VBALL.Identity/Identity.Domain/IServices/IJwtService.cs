using Identity.Domain.Entities;

namespace Identity.Domain.IServices
{
    public interface IJwtService
    {
        string GenerateJwtToken(User user);
        string GenerateRefreshToken();
    }
}
