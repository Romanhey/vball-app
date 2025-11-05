using Schedule.Domain.Entities;

namespace Schedule.Domain.IRepositories
{
    public interface IParticipationRepository : ICrudRepository<Participation>, IGetAllRepository<Participation>
    {
        Task<Participation?> GetByMatchAndPlayerAsync(int matchId, int playerId, CancellationToken cancellationToken);
        Task<List<Participation>> GetByMatchAsync(int matchId, CancellationToken cancellationToken);
        Task<List<Participation>> GetByPlayerAsync(int playerId, CancellationToken cancellationToken);
        Task<List<Participation>> GetByStatusAsync(ParticipationStatus status, CancellationToken cancellationToken);
    }
}
