using Identity.Domain.Entities;
using Identity.Domain.IRepository;

namespace Identity.Infastucture.Persistance.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly ApplicationDbContext _context;

        public RefreshTokenRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task AddAsync(RefreshTokenModel model)
        {
            await _context.RefreshTokens.AddAsync(model);
        }

        public Task DeleteAsync(RefreshTokenModel model)
        {
            _context.RefreshTokens.Remove(model);
            return Task.CompletedTask;
        }

        public async Task<RefreshTokenModel?> GetByIdAsync(int id)
        {
            return await _context.RefreshTokens.FindAsync(id);
        }

        public Task UpdateAsync(RefreshTokenModel model)
        {
            _context.RefreshTokens.Update(model);
            return Task.CompletedTask;
        }
    }
}
