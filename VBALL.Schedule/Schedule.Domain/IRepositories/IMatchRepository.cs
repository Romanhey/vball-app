using Schedule.Domain.Entities;

namespace Schedule.Domain.IRepositories
{
    public interface IMatchRepository : ICrudRepository<Match>, IGetAllRepository<Match>, IPaginationRepository<Match>
    {
        Task<bool> HasActiveMatchesForTeamAsync(int teamId, CancellationToken cancellationToken = default);
        Task<List<Match>> GetMatchesByTeamIdAsync(int teamId, CancellationToken cancellationToken = default);
    }
}
