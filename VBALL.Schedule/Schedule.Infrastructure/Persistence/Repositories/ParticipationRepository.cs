using Microsoft.EntityFrameworkCore;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Infrastructure.Persistence.Repositories
{
    public class ParticipationRepository(ApplicationDbContext context) : IParticipationRepository
    {
        public async Task AddAsync(Participation entity, CancellationToken cancellationToken = default)
        {
            await context.Participations.AddAsync(entity, cancellationToken);
        }

        public Task DeleteAsync(Participation entity, CancellationToken cancellationToken = default)
        {
            context.Participations.Remove(entity);
            return Task.CompletedTask;
        }

        public IQueryable<Participation> GetAll()
        {
            return context.Participations.AsQueryable();
        }

        public async Task<List<Participation>> GetAllAsync(CancellationToken cancellationToken)
        {
            return await context.Participations.ToListAsync();
        }

        public async Task<Participation?> GetByIdAsynd(int id, CancellationToken cancellationToken)
        {
            return await context.Participations.FindAsync(id, cancellationToken);
        }

        public Task<Participation?> GetByIdAsynd(int id)
        {
            throw new NotImplementedException();
        }

        public Task UpdateAsync(Participation entity, CancellationToken cancellationToken = default)
        {
            context.Participations.Update(entity);
            return Task.CompletedTask;
        }
    }
}
