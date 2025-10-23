using Microsoft.EntityFrameworkCore;
using Schedule.Domain.Entities;

namespace Schedule.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        public DbSet<Match> Matches { get; init; }
        public DbSet<Team> Teams { get; init; }
        public DbSet<Participation> Participations { get; init; }
        public DbSet<TeamAssignment> TeamAssignments { get; init; }
    }
}