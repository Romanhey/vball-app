using Microsoft.EntityFrameworkCore;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;
using System.Reflection.Metadata.Ecma335;

namespace Schedule.Infractructure.Persistence.Repositories
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

        public async Task<List<Participation>> GetAllAsync()
        {
            return await context.Participations.ToListAsync();
        }

        public async Task<Participation?> GetByIdAsynd(int id, CancellationToken cancellationToken)
        {
            return await context.Participations.FindAsync(id, cancellationToken);
        }

        public Task UpdateAsync(Participation entity, CancellationToken cancellationToken = default)
        {
            context.Participations.Update(entity);
            return Task.CompletedTask;
        }
    }
}
