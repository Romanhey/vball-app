using Microsoft.EntityFrameworkCore;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Infrastructure.Persistence.Repositories
{
    public class TeamRepository(ApplicationDbContext context) : ITeamRepository
    {
        public async Task AddAsync(Team entity, CancellationToken cancellationToken = default)
        {
            await context.Teams.AddAsync(entity, cancellationToken);
        }

        public Task DeleteAsync(Team entity, CancellationToken cancellationToken = default)
        {
            context.Teams.Remove(entity);
            return Task.CompletedTask;
        }

        public IQueryable<Team> GetAll()
        {
            return context.Teams.AsQueryable();
        }

        public async Task<List<Team>> GetAllAsync(CancellationToken cancellationToken)
        {
            return await context.Teams.ToListAsync(cancellationToken);
        }

        public async Task<Team?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await context.Teams.FindAsync(id, cancellationToken);
        }

        public Task UpdateAsync(Team entity, CancellationToken cancellationToken = default)
        {
            context.Teams.Update(entity);
            return Task.CompletedTask;
        }
    }
}
