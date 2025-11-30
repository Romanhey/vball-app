using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories.BaseRepos;

namespace Schedule.Domain.IRepositories
{
    public interface IMatchRepository : IBaseRepository<Match>
    {
        Task<bool> HasActiveMatchesForTeamAsync(int teamId, CancellationToken cancellationToken = default);
        Task<List<Match>> GetMatchesByTeamIdAsync(int teamId, CancellationToken cancellationToken = default);
    }
}
