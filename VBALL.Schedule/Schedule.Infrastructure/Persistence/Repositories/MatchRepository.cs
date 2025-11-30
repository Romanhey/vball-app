using Microsoft.EntityFrameworkCore;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Infrastructure.Persistence.Repositories
{
    public class MatchRepository(ApplicationDbContext context) : BaseRepository<Match>(context), IMatchRepository
    {
        public async Task<bool> HasActiveMatchesForTeamAsync(int teamId, CancellationToken cancellationToken = default)
        {
            return await Context.Matches
                .AnyAsync(m => (m.TeamAId == teamId || m.TeamBId == teamId)
                    && (m.Status == MatchStatus.Scheduled || m.Status == MatchStatus.InProgress),
                    cancellationToken);
        }

        public async Task<List<Match>> GetMatchesByTeamIdAsync(int teamId, CancellationToken cancellationToken = default)
        {
            return await Context.Matches
                .Where(m => m.TeamAId == teamId || m.TeamBId == teamId)
                .ToListAsync(cancellationToken);
        }
    }
}