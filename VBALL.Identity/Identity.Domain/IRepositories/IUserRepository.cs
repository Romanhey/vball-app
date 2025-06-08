using Identity.Domain.Entities;

namespace Identity.Domain.IRepository
{
    public interface IUserRepository
    {
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(User user);

        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<List<User>> GetAllAsync(int page, int pageSize);

        Task<int> GetCountAsync();
    }
}
