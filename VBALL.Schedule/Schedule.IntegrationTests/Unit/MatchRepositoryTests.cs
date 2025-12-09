using System.Linq;
using System.Threading.Tasks;
using Bogus;
using FluentAssertions;
using Schedule.Domain.Entities;
using Schedule.Infrastructure.Persistence.Repositories;
using Xunit;

namespace Schedule.IntegrationTests.Unit;

public class MatchRepositoryTests : RepositoryTestBase
{
    private readonly Faker<Match> _faker = new Faker<Match>()
        .RuleFor(m => m.MatchId, f => f.IndexFaker + 1)
        .RuleFor(m => m.TeamAId, f => f.Random.Int(1, 50))
        .RuleFor(m => m.TeamBId, f => f.Random.Int(51, 100))
        .RuleFor(m => m.StartTime, f => f.Date.Future().ToUniversalTime())
        .RuleFor(m => m.Status, f => MatchStatus.Scheduled);

    [Fact]
    public async Task Add_and_get_by_id_works()
    {
        using var ctx = CreateInMemoryContext(nameof(Add_and_get_by_id_works));
        var repo = new MatchRepository(ctx);
        var match = _faker.Generate();

        await repo.AddAsync(match);
        await ctx.SaveChangesAsync();

        var loaded = await repo.GetByIdAsync(match.MatchId, CancellationToken.None);

        loaded.Should().NotBeNull();
        loaded!.MatchId.Should().Be(match.MatchId);
    }

    [Fact]
    public async Task Update_persists_changes()
    {
        using var ctx = CreateInMemoryContext(nameof(Update_persists_changes));
        var repo = new MatchRepository(ctx);
        var match = _faker.Generate();
        await repo.AddAsync(match);
        await ctx.SaveChangesAsync();

        match.Status = MatchStatus.Finished;
        await repo.UpdateAsync(match);
        await ctx.SaveChangesAsync();

        (await repo.GetByIdAsync(match.MatchId, CancellationToken.None))!.Status.Should().Be(MatchStatus.Finished);
    }

    [Fact]
    public async Task Delete_removes_entity()
    {
        using var ctx = CreateInMemoryContext(nameof(Delete_removes_entity));
        var repo = new MatchRepository(ctx);
        var match = _faker.Generate();
        await repo.AddAsync(match);
        await ctx.SaveChangesAsync();

        await repo.DeleteAsync(match);
        await ctx.SaveChangesAsync();

        (await repo.GetByIdAsync(match.MatchId, CancellationToken.None)).Should().BeNull();
    }

    [Fact]
    public async Task HasActiveMatchesForTeamAsync_respects_status()
    {
        using var ctx = CreateInMemoryContext(nameof(HasActiveMatchesForTeamAsync_respects_status));
        ctx.Matches.Add(new Match { MatchId = 1, TeamAId = 5, TeamBId = 6, StartTime = DateTime.UtcNow, Status = MatchStatus.Scheduled });
        ctx.Matches.Add(new Match { MatchId = 2, TeamAId = 5, TeamBId = 7, StartTime = DateTime.UtcNow, Status = MatchStatus.InProgress });
        ctx.Matches.Add(new Match { MatchId = 3, TeamAId = 5, TeamBId = 8, StartTime = DateTime.UtcNow, Status = MatchStatus.Finished });
        await ctx.SaveChangesAsync();

        var repo = new MatchRepository(ctx);

        var hasActive = await repo.HasActiveMatchesForTeamAsync(5);

        hasActive.Should().BeTrue();
    }

    [Fact]
    public async Task GetMatchesByTeamIdAsync_returns_all_for_team()
    {
        using var ctx = CreateInMemoryContext(nameof(GetMatchesByTeamIdAsync_returns_all_for_team));
        ctx.Matches.Add(new Match { MatchId = 1, TeamAId = 1, TeamBId = 2, StartTime = DateTime.UtcNow, Status = MatchStatus.Scheduled });
        ctx.Matches.Add(new Match { MatchId = 2, TeamAId = 3, TeamBId = 1, StartTime = DateTime.UtcNow, Status = MatchStatus.Scheduled });
        ctx.Matches.Add(new Match { MatchId = 3, TeamAId = 4, TeamBId = 5, StartTime = DateTime.UtcNow, Status = MatchStatus.Scheduled });
        await ctx.SaveChangesAsync();

        var repo = new MatchRepository(ctx);

        var matches = await repo.GetMatchesByTeamIdAsync(1);

        matches.Should().HaveCount(2);
        matches.Select(m => m.MatchId).Should().Contain(new[] { 1, 2 });
    }

    [Fact]
    public async Task GetAsync_supports_filter_and_paging()
    {
        using var ctx = CreateInMemoryContext(nameof(GetAsync_supports_filter_and_paging));
        var repo = new MatchRepository(ctx);
        var matches = _faker.Generate(10);
        await ctx.Matches.AddRangeAsync(matches);
        await ctx.SaveChangesAsync();

        var filtered = await repo.GetAsync<Match>(
            filter: m => m.TeamAId == matches[0].TeamAId);
        filtered.Should().OnlyContain(m => m.TeamAId == matches[0].TeamAId);

        var paged = await repo.GetAsync<Match>(
            skip: 2,
            take: 3);
        paged.Should().HaveCount(3);
    }
}

