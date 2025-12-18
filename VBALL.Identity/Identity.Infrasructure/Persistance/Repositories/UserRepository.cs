using Identity.Domain.Entities;
using Identity.Domain.IRepository;
using Identity.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Identity.Infastucture.Persistance.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(User user)
        {
          await _context.Users.AddAsync(user);
        }

        public Task DeleteAsync(User user)
        {
            _context.Users.Remove(user);
            return Task.CompletedTask;
        }

        public async Task<List<User>> GetAllAsync(int page, int pageSize)
        {
            return await _context.Users.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(x=>x.Email == email);
        }

        public Task<User?> GetByIdAsync(int id)
        {
            return _context.Users.FirstOrDefaultAsync(x=> x.Id == id);
        }

        public Task UpdateAsync(User user)
        {
             _context.Users.Update(user);
            return Task.CompletedTask;
        }

        public Task<int> GetCountAsync()
        {
            return _context.Users.CountAsync();
        }

        public Task<List<User>> GetByIdsAsync(IEnumerable<int> ids)
        {
            return _context.Users
                .Where(user => ids.Contains(user.Id))
                .ToListAsync();
        }
    }
}
