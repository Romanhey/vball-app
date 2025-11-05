using Schedule.Domain.IRepositories;

namespace Schedule.Infrastructure.Persistence
{
    public class UnitOfWork(
        ApplicationDbContext context,
        ITeamRepository teamRepository,
        ITeamAssignmentRepository teamAssignmentRepository,
        IParticipationRepository participationRepository,
        IMatchRepository matchRepository) : IUnitOfWork
    {
        public IMatchRepository MatchRepository => matchRepository;

        public IParticipationRepository ParticipationRepository => participationRepository;

        public ITeamAssignmentRepository TeamAssignmentRepository => teamAssignmentRepository;

        public ITeamRepository TeamRepository => teamRepository;

        public async Task SaveChangesAsync(CancellationToken cancellationToken)
        {
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
