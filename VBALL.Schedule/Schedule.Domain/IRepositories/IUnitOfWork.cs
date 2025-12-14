namespace Schedule.Domain.IRepositories
{
    public interface IUnitOfWork
    {
        public IMatchRepository MatchRepository { get; }
        public IParticipationRepository ParticipationRepository { get; }
        public ITeamRepository TeamRepository { get; }
        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}
