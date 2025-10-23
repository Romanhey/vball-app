using Microsoft.EntityFrameworkCore;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Infrastructure.Persistence.Repositories
{
    public class TeamAssigmentRepository(ApplicationDbContext context) : ITeamAssigmentRepository
    {
        public async Task AddAsync(TeamAssigment entity, CancellationToken cancellationToken = default)
        {
            await context.TeamAssigments.AddAsync(entity, cancellationToken);
        }

        public Task DeleteAsync(TeamAssigment entity, CancellationToken cancellationToken = default)
        {
            context.TeamAssigments.Remove(entity);
            return Task.CompletedTask;
        }

        public IQueryable<TeamAssigment> GetAll()
        {
            return context.TeamAssigments.AsQueryable();
        }

        public async Task<List<TeamAssigment>> GetAllAsync(CancellationToken cancellationToken)
        {
            return await context.TeamAssigments.ToListAsync();
        }

        public async Task<TeamAssigment?> GetByIdAsynd(int id, CancellationToken cancellationToken = default)
        {
            return await context.TeamAssigments.FindAsync(id, cancellationToken);
        }

        public Task<TeamAssigment?> GetByIdAsynd(int id)
        {
            throw new NotImplementedException();
        }

        public Task UpdateAsync(TeamAssigment entity, CancellationToken cancellationToken = default)
        {
            context.TeamAssigments.Update(entity);
            return Task.CompletedTask;
        }
    }
}
