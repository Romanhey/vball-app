using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Schedule.Domain.Entities;
using Schedule.Infrastructure.Persistence.Repositories;
using Xunit;

namespace Schedule.IntegrationTests.Unit;

public class MatchRepositoryTests : RepositoryTestBase
{
    [Fact]
    public async Task HasActiveMatchesForTeamAsync_returns_true_for_scheduled_or_inprogress()
    {
        using var ctx = CreateInMemoryContext(nameof(HasActiveMatchesForTeamAsync_returns_true_for_scheduled_or_inprogress));
        ctx.Matches.Add(new Match { MatchId = 1, TeamAId = 5, TeamBId = 6, StartTime = DateTime.UtcNow, Status = MatchStatus.Scheduled });
        ctx.Matches.Add(new Match { MatchId = 2, TeamAId = 7, TeamBId = 8, StartTime = DateTime.UtcNow, Status = MatchStatus.Finished });
        await ctx.SaveChangesAsync();

        var repo = new MatchRepository(ctx);

        var hasActive = await repo.HasActiveMatchesForTeamAsync(5);
        var noActive = await repo.HasActiveMatchesForTeamAsync(7);

        hasActive.Should().BeTrue();
        noActive.Should().BeFalse();
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
}
