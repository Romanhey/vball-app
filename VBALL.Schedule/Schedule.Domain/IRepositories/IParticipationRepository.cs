using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories.BaseRepos;

namespace Schedule.Domain.IRepositories
{
    public interface IParticipationRepository : IBaseRepository<Participation>
    {
        Task<Participation?> GetByMatchAndPlayerAsync(int matchId, int playerId, CancellationToken cancellationToken);
        Task<List<Participation>> GetByMatchAsync(int matchId, CancellationToken cancellationToken);
        Task<List<Participation>> GetByPlayerAsync(int playerId, CancellationToken cancellationToken);
        Task<List<Participation>> GetByStatusAsync(ParticipationStatus status, CancellationToken cancellationToken);
        Task<List<Participation>> GetByTeamIdAsync(int teamId, CancellationToken cancellationToken);
        Task<int> GetActiveParticipationCountForMatchAsync(int matchId, CancellationToken cancellationToken);
    }
}
