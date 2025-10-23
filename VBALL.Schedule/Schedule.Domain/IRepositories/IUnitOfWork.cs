namespace Schedule.Domain.IRepositories
{
    public interface IUnitOfWork
    {
        public IMatchRepository MatchRepository { get; }
        public IParticipationRepository ParticipationRepository { get; }
        public ITeamAssigmentRepository TamAssigmentRepository { get; }
        public ITeamRepository TamRepository { get; }
        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}
