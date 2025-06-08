using Identity.Domain.Entities;
using Identity.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace Identity.Infastucture.Persistance
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        public DbSet<User> Users { get; set; }
    }
}
