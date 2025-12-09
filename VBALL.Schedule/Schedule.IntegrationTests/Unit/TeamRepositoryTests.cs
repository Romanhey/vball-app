using System.Threading.Tasks;
using FluentAssertions;
using Schedule.Domain.Entities;
using Schedule.Infrastructure.Persistence.Repositories;
using Xunit;

namespace Schedule.IntegrationTests.Unit;

public class TeamRepositoryTests : RepositoryTestBase
{
    [Fact]
    public async Task Add_and_get_team_by_id()
    {
        using var ctx = CreateInMemoryContext(nameof(Add_and_get_team_by_id));
        var repo = new TeamRepository(ctx);

        var team = new Team { TeamId = 10, Name = "Testers", Rating = 9.1 };
        await repo.AddAsync(team);
        await ctx.SaveChangesAsync();

        var loaded = await repo.GetByIdAsync(10, CancellationToken.None);

        loaded.Should().NotBeNull();
        loaded!.Name.Should().Be("Testers");
    }
}
