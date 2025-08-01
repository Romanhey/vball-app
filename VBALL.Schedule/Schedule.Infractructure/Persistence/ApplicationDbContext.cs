using Microsoft.EntityFrameworkCore;
using Schedule.Domain.Entities;

namespace Schedule.Infractructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        public DbSet<Match> Matches { get; init; }
        public DbSet<Team> Teams { get; init; }
        public DbSet<Participation> Participations { get; init; }
        public DbSet<TeamAssigment> TeamAssigment { get; init; }
    }
}