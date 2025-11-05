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
            return await context.Matches.ToListAsync(cancellationToken);
        }

        public async Task<Match?> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await context.Matches.FindAsync(id, cancellationToken);
        }

        public async Task<List<Match>> GetRangeAsync(int skip, int take, CancellationToken cancellationToken)
        {
            return await context.Matches
                .Skip((skip - 1) * take)
                .Take(take)
                .ToListAsync(cancellationToken);
        }

        public Task UpdateAsync(Match entity, CancellationToken cancellationToken = default)
        {
            context.Matches.Update(entity);
            return Task.CompletedTask;
        }

        public async Task<bool> HasActiveMatchesForTeamAsync(int teamId, CancellationToken cancellationToken = default)
        {
            return await context.Matches
                .AnyAsync(m => (m.TeamAId == teamId || m.TeamBId == teamId)
                    && (m.Status == MatchStatus.Scheduled || m.Status == MatchStatus.InProgress),
                    cancellationToken);
        }

        public async Task<List<Match>> GetMatchesByTeamIdAsync(int teamId, CancellationToken cancellationToken = default)
        {
            return await context.Matches
                .Where(m => m.TeamAId == teamId || m.TeamBId == teamId)
                .ToListAsync(cancellationToken);
        }
    }
}