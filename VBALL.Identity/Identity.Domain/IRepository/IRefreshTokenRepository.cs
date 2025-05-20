using Identity.Domain.Entities;

namespace Identity.Domain.IRepository
{
    public interface IRefreshTokenRepository
    {
        Task AddAsync(RefreshTokenModel model);
        Task DeleteAsync(RefreshTokenModel model);

        Task<RefreshTokenModel?> GetByIdAsync(int id);

        Task UpdateAsync(RefreshTokenModel model);
    }
}
