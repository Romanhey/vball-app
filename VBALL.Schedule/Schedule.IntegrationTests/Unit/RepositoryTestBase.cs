using Microsoft.EntityFrameworkCore;
using Schedule.Infrastructure.Persistence;

namespace Schedule.IntegrationTests.Unit;

public abstract class RepositoryTestBase
{
    protected static ApplicationDbContext CreateInMemoryContext(string name)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(name)
            .Options;

        return new ApplicationDbContext(options);
    }
}
