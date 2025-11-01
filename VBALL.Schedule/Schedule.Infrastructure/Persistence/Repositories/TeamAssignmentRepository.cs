using Microsoft.EntityFrameworkCore;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Infrastructure.Persistence.Repositories
{
    public class TeamAssignmentRepository(ApplicationDbContext context) : ITeamAssignmentRepository
    {
        public async Task AddAsync(TeamAssignment entity, CancellationToken cancellationToken = default)
        {
            await context.TeamAssignments.AddAsync(entity, cancellationToken);
        }

        public Task DeleteAsync(TeamAssignment entity, CancellationToken cancellationToken = default)
        {
            context.TeamAssignments.Remove(entity);
            return Task.CompletedTask;
        }

        public IQueryable<TeamAssignment> GetAll()
        {
            return context.TeamAssignments.AsQueryable();
        }

        public async Task<List<TeamAssignment>> GetAllAsync(CancellationToken cancellationToken)
        {
            return await context.TeamAssignments.ToListAsync();
        }

        public async Task<TeamAssignment?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await context.TeamAssignments.FindAsync(id, cancellationToken);
        }

        public Task<TeamAssignment?> GetByIdAsynd(int id)
        {
            throw new NotImplementedException();
        }

        public Task UpdateAsync(TeamAssignment entity, CancellationToken cancellationToken = default)
        {
            context.TeamAssignments.Update(entity);
            return Task.CompletedTask;
        }
    }
}
