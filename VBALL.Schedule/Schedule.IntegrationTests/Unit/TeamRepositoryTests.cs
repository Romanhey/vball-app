using System.Linq;
using System.Threading.Tasks;
using Bogus;
using FluentAssertions;
using Schedule.Domain.Entities;
using Schedule.Infrastructure.Persistence.Repositories;
using Xunit;

namespace Schedule.IntegrationTests.Unit;

public class TeamRepositoryTests : RepositoryTestBase
{
    private readonly Faker<Team> _faker = new Faker<Team>()
        .RuleFor(t => t.TeamId, f => f.IndexFaker + 1)
        .RuleFor(t => t.Name, f => f.Company.CompanyName())
        .RuleFor(t => t.Rating, f => f.Random.Double(1, 9.9));

    [Fact]
    public async Task Add_get_update_delete_team()
    {
        using var ctx = CreateInMemoryContext(nameof(Add_get_update_delete_team));
        var repo = new TeamRepository(ctx);
        var team = _faker.Generate();

        await repo.AddAsync(team);
        await ctx.SaveChangesAsync();

        var loaded = await repo.GetByIdAsync(team.TeamId, CancellationToken.None);
        loaded.Should().NotBeNull();

        team.Name = "Updated";
        await repo.UpdateAsync(team);
        await ctx.SaveChangesAsync();
        (await repo.GetByIdAsync(team.TeamId, CancellationToken.None))!.Name.Should().Be("Updated");

        await repo.DeleteAsync(team);
        await ctx.SaveChangesAsync();
        (await repo.GetByIdAsync(team.TeamId, CancellationToken.None)).Should().BeNull();
    }

    [Fact]
    public async Task GetAsync_supports_filter_and_paging()
    {
        using var ctx = CreateInMemoryContext(nameof(GetAsync_supports_filter_and_paging));
        var repo = new TeamRepository(ctx);
        var teams = _faker.Generate(8);
        await ctx.Teams.AddRangeAsync(teams);
        await ctx.SaveChangesAsync();

        var filtered = await repo.GetAsync<Team>(filter: t => t.Name.Contains(" "));
        filtered.Should().OnlyContain(t => t.Name.Contains(" "));

        var paged = await repo.GetAsync<Team>(skip: 3, take: 2);
        paged.Should().HaveCount(2);
    }
}

