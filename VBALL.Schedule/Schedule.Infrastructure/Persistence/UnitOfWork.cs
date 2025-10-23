using Schedule.Domain.IRepositories;

namespace Schedule.Infrastructure.Persistence
{
    public class UnitOfWork(
        ApplicationDbContext context,
        ITeamRepository teamRepository,
        ITeamAssigmentRepository teamAssigmentRepository,
        IParticipationRepository participationRepository,
        IMatchRepository matchRepository) : IUnitOfWork
    {
        public IMatchRepository MatchRepository => matchRepository;

        public IParticipationRepository ParticipationRepository => participationRepository;

        public ITeamAssigmentRepository TamAssigmentRepository => teamAssigmentRepository;

        public ITeamRepository TamRepository => teamRepository;

        public async Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
