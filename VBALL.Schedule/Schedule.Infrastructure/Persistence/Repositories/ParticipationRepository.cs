using Microsoft.EntityFrameworkCore;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Infrastructure.Persistence.Repositories
{
    public class ParticipationRepository(ApplicationDbContext context) : IParticipationRepository
    {
        public async Task AddAsync(Participation entity, CancellationToken cancellationToken = default)
        {
            await context.Participation.AddAsync(entity, cancellationToken);
        }

        public Task DeleteAsync(Participation entity, CancellationToken cancellationToken = default)
        {
            context.Participation.Remove(entity);
            return Task.CompletedTask;
        }

        public IQueryable<Participation> GetAll()
        {
            return context.Participation.AsQueryable();
        }

        public async Task<List<Participation>> GetAllAsync(CancellationToken cancellationToken)
        {
            return await context.Participation.ToListAsync(cancellationToken);
        }

        public async Task<Participation?> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await context.Participation.FindAsync(id, cancellationToken);
        }

        public async Task<Participation?> GetByMatchAndPlayerAsync(int matchId, int playerId, CancellationToken cancellationToken)
        {
            return await context.Participation
                .FirstOrDefaultAsync(p => p.MatchId == matchId && p.PlayerId == playerId, cancellationToken);
        }

        public async Task<List<Participation>> GetByMatchAsync(int matchId, CancellationToken cancellationToken)
        {
            return await context.Participation
                .Where(p => p.MatchId == matchId)
                .OrderBy(p => p.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Participation>> GetByPlayerAsync(int playerId, CancellationToken cancellationToken)
        {
            return await context.Participation
                .Where(p => p.PlayerId == playerId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Participation>> GetByStatusAsync(ParticipationStatus status, CancellationToken cancellationToken)
        {
            return await context.Participation
                .Where(p => p.Status == status)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public Task UpdateAsync(Participation entity, CancellationToken cancellationToken = default)
        {
            context.Participation.Update(entity);
            return Task.CompletedTask;
        }

        public async Task<List<Participation>> GetByTeamIdAsync(int teamId, CancellationToken cancellationToken)
        {
            return await context.Participation
                .Where(p => p.TeamId == teamId)
                .OrderBy(p => p.CreatedAt)
                .ToListAsync(cancellationToken);
        }
    }
}
