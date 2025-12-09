using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Schedule.Domain.Entities;
using Schedule.Infrastructure.Persistence.Repositories;
using Xunit;

namespace Schedule.IntegrationTests.Unit;

public class ParticipationRepositoryTests : RepositoryTestBase
{
    [Fact]
    public async Task GetActiveParticipationCountForMatchAsync_counts_registered_and_confirmed()
    {
        using var ctx = CreateInMemoryContext(nameof(GetActiveParticipationCountForMatchAsync_counts_registered_and_confirmed));
        ctx.Participation.AddRange(
            new Participation { ParticipationId = 1, MatchId = 1, PlayerId = 1, CreatedAt = DateTime.UtcNow, Status = ParticipationStatus.Registered },
            new Participation { ParticipationId = 2, MatchId = 1, PlayerId = 2, CreatedAt = DateTime.UtcNow, Status = ParticipationStatus.Confirmed },
            new Participation { ParticipationId = 3, MatchId = 1, PlayerId = 3, CreatedAt = DateTime.UtcNow, Status = ParticipationStatus.Cancelled }
        );
        await ctx.SaveChangesAsync();

        var repo = new ParticipationRepository(ctx);

        var count = await repo.GetActiveParticipationCountForMatchAsync(1, CancellationToken.None);

        count.Should().Be(2);
    }

    [Fact]
    public async Task GetByMatchAsync_orders_by_createdAt()
    {
        using var ctx = CreateInMemoryContext(nameof(GetByMatchAsync_orders_by_createdAt));
        ctx.Participation.AddRange(
            new Participation { ParticipationId = 1, MatchId = 1, PlayerId = 1, CreatedAt = DateTime.UtcNow.AddMinutes(5), Status = ParticipationStatus.Registered },
            new Participation { ParticipationId = 2, MatchId = 1, PlayerId = 2, CreatedAt = DateTime.UtcNow.AddMinutes(-5), Status = ParticipationStatus.Registered }
        );
        await ctx.SaveChangesAsync();

        var repo = new ParticipationRepository(ctx);

        var list = await repo.GetByMatchAsync(1, CancellationToken.None);

        list.Select(x => x.ParticipationId).Should().ContainInOrder(2, 1);
    }
}
