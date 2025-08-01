using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Schedule.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var configuration = (new Microsoft.Extensions.Configuration.ConfigurationBuilder())
            .SetBasePath(Directory.GetCurrentDirectory()) 
            .AddJsonFile("appsettings.json")
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}