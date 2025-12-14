using Microsoft.EntityFrameworkCore;
using Schedule.Domain.Entities;

namespace Schedule.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        public DbSet<Match> Matches { get; init; }
        public DbSet<Team> Teams { get; init; }
        public DbSet<Participation> Participation { get; init; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Participation>()
                .HasOne<Team>()
                .WithMany()
                .HasForeignKey(p => p.TeamId)
                .IsRequired(false);
        }
    }
}