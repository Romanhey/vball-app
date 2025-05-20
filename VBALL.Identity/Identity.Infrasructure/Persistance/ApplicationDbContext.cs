using Identity.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Identity.Infastucture.Persistance
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        public DbSet<User> Users { get; set; }

        public DbSet<RefreshTokenModel> RefreshTokens { get; set; }
    }
}
