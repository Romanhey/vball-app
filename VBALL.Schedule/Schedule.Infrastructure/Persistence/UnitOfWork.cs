using Schedule.Domain.IRepositories;

namespace Schedule.Infrastructure.Persistence
{
    public class UnitOfWork(
        ApplicationDbContext context,
        ITeamRepository teamRepository,
        IParticipationRepository participationRepository,
        IMatchRepository matchRepository) : IUnitOfWork
    {
        public IMatchRepository MatchRepository => matchRepository;

        public IParticipationRepository ParticipationRepository => participationRepository;


        public ITeamRepository TeamRepository => teamRepository;

        public async Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
