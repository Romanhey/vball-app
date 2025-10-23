using Microsoft.EntityFrameworkCore;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Infrastructure.Persistence.Repositories
{
    public class MatchRepository(ApplicationDbContext context) : IMatchRepository
    {
        public async Task AddAsync(Match entity, CancellationToken cancellationToken = default)
        {
            await context.Matches.AddAsync(entity, cancellationToken);
        }

        public Task DeleteAsync(Match entity, CancellationToken cancellationToken = default)
        {
            context.Matches.Remove(entity);
            return Task.CompletedTask;
        }

        public IQueryable<Match> GetAll()
        {
            return context.Matches.AsQueryable();
        }

        public async Task<List<Match>> GetAllAsync(CancellationToken cancellationToken)
        {
            return await context.Matches.ToListAsync();
        }

        public async Task<Match?> GetByIdAsynd(int id, CancellationToken cancellationToken)
        {
            return await context.Matches.FindAsync(id, cancellationToken);
        }

        public async Task<List<Match>> GetRangeAsync(int skip, int take, CancellationToken cancellationToken)
        {
            return await context.Matches
                .Skip((skip - 1) * take)
                .Take(take)
                .ToListAsync();
        }

        public Task UpdateAsync(Match entity, CancellationToken cancellationToken = default)
        {
            context.Matches.Update(entity);
            return Task.CompletedTask;
        }
    }
}
