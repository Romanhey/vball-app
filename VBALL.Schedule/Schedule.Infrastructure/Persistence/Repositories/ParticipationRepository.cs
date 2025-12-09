using Microsoft.EntityFrameworkCore;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Infrastructure.Persistence.Repositories
{
    public class ParticipationRepository(ApplicationDbContext context) : BaseRepository<Participation>(context), IParticipationRepository
    {
        public async Task<Participation?> GetByMatchAndPlayerAsync(int matchId, int playerId, CancellationToken cancellationToken)
        {
            return await Context.Participation
                .FirstOrDefaultAsync(p => p.MatchId == matchId && p.PlayerId == playerId, cancellationToken);
        }

        public async Task<List<Participation>> GetByMatchAsync(int matchId, CancellationToken cancellationToken)
        {
            return await Context.Participation
                .Where(p => p.MatchId == matchId)
                .OrderBy(p => p.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Participation>> GetByPlayerAsync(int playerId, CancellationToken cancellationToken)
        {
            return await Context.Participation
                .Where(p => p.PlayerId == playerId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Participation>> GetByStatusAsync(ParticipationStatus status, CancellationToken cancellationToken)
        {
            return await Context.Participation
                .Where(p => p.Status == status)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Participation>> GetByTeamIdAsync(int teamId, CancellationToken cancellationToken)
        {
            return await Context.Participation
                .Where(p => p.TeamId == teamId)
                .OrderBy(p => p.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<int> GetActiveParticipationCountForMatchAsync(int matchId, CancellationToken cancellationToken)
        {
            return await Context.Participation
                .CountAsync(p => p.MatchId == matchId
                    && (p.Status == ParticipationStatus.Registered 
                        || p.Status == ParticipationStatus.Confirmed),
                    cancellationToken);
        }

    }
}
