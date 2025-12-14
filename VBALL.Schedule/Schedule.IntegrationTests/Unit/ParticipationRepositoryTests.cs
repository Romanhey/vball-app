using System.Linq;
using System.Threading.Tasks;
using Bogus;
using FluentAssertions;
using Schedule.Domain.Entities;
using Schedule.Infrastructure.Persistence.Repositories;
using Xunit;

namespace Schedule.IntegrationTests.Unit;

public class ParticipationRepositoryTests : RepositoryTestBase
{
    private readonly Faker<Participation> _faker = new Faker<Participation>()
        .RuleFor(p => p.ParticipationId, f => f.IndexFaker + 1)
        .RuleFor(p => p.MatchId, f => f.Random.Int(1, 5))
        .RuleFor(p => p.PlayerId, f => f.Random.Int(100, 200))
        .RuleFor(p => p.TeamId, f => f.Random.Int(1, 3))
        .RuleFor(p => p.CreatedAt, f => f.Date.Recent().ToUniversalTime())
        .RuleFor(p => p.Status, f => ParticipationStatus.Registered);

    [Fact]
    public async Task Add_get_update_delete_work()
    {
        using var ctx = CreateInMemoryContext(nameof(Add_get_update_delete_work));
        var repo = new ParticipationRepository(ctx);
        var p = _faker.Generate();

        await repo.AddAsync(p);
        await ctx.SaveChangesAsync();

        var loaded = await repo.GetByIdAsync(p.ParticipationId, CancellationToken.None);
        loaded.Should().NotBeNull();

        p.Status = ParticipationStatus.Confirmed;
        await repo.UpdateAsync(p);
        await ctx.SaveChangesAsync();
        (await repo.GetByIdAsync(p.ParticipationId, CancellationToken.None))!.Status.Should().Be(ParticipationStatus.Confirmed);

        await repo.DeleteAsync(p);
        await ctx.SaveChangesAsync();
        (await repo.GetByIdAsync(p.ParticipationId, CancellationToken.None)).Should().BeNull();
    }

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
    public async Task GetByMatchAndPlayerAsync_returns_entity()
    {
        using var ctx = CreateInMemoryContext(nameof(GetByMatchAndPlayerAsync_returns_entity));
        var participation = new Participation
        {
            ParticipationId = 10,
            MatchId = 2,
            PlayerId = 99,
            CreatedAt = DateTime.UtcNow,
            Status = ParticipationStatus.Registered
        };
        ctx.Participation.Add(participation);
        await ctx.SaveChangesAsync();

        var repo = new ParticipationRepository(ctx);
        var loaded = await repo.GetByMatchAndPlayerAsync(2, 99, CancellationToken.None);

        loaded.Should().NotBeNull();
        loaded!.ParticipationId.Should().Be(10);
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

    [Fact]
    public async Task GetByPlayerAsync_returns_desc_by_created()
    {
        using var ctx = CreateInMemoryContext(nameof(GetByPlayerAsync_returns_desc_by_created));
        ctx.Participation.AddRange(
            new Participation { ParticipationId = 1, MatchId = 1, PlayerId = 5, CreatedAt = DateTime.UtcNow, Status = ParticipationStatus.Registered },
            new Participation { ParticipationId = 2, MatchId = 2, PlayerId = 5, CreatedAt = DateTime.UtcNow.AddMinutes(10), Status = ParticipationStatus.Registered }
        );
        await ctx.SaveChangesAsync();

        var repo = new ParticipationRepository(ctx);
        var list = await repo.GetByPlayerAsync(5, CancellationToken.None);

        list.First().ParticipationId.Should().Be(2);
    }

    [Fact]
    public async Task GetByStatusAsync_filters_by_status()
    {
        using var ctx = CreateInMemoryContext(nameof(GetByStatusAsync_filters_by_status));
        ctx.Participation.AddRange(
            new Participation { ParticipationId = 1, MatchId = 1, PlayerId = 1, CreatedAt = DateTime.UtcNow, Status = ParticipationStatus.Registered },
            new Participation { ParticipationId = 2, MatchId = 2, PlayerId = 2, CreatedAt = DateTime.UtcNow, Status = ParticipationStatus.Waitlisted }
        );
        await ctx.SaveChangesAsync();

        var repo = new ParticipationRepository(ctx);
        var list = await repo.GetByStatusAsync(ParticipationStatus.Waitlisted, CancellationToken.None);

        list.Should().HaveCount(1);
        list[0].ParticipationId.Should().Be(2);
    }

    [Fact]
    public async Task GetByTeamIdAsync_filters_by_team()
    {
        using var ctx = CreateInMemoryContext(nameof(GetByTeamIdAsync_filters_by_team));
        ctx.Participation.AddRange(
            new Participation { ParticipationId = 1, MatchId = 1, PlayerId = 1, TeamId = 10, CreatedAt = DateTime.UtcNow, Status = ParticipationStatus.Confirmed },
            new Participation { ParticipationId = 2, MatchId = 1, PlayerId = 2, TeamId = 11, CreatedAt = DateTime.UtcNow, Status = ParticipationStatus.Confirmed }
        );
        await ctx.SaveChangesAsync();

        var repo = new ParticipationRepository(ctx);
        var list = await repo.GetByTeamIdAsync(10, CancellationToken.None);

        list.Should().HaveCount(1);
        list[0].TeamId.Should().Be(10);
    }

    [Fact]
    public async Task GetAsync_supports_filter_selector_and_paging()
    {
        using var ctx = CreateInMemoryContext(nameof(GetAsync_supports_filter_selector_and_paging));
        var repo = new ParticipationRepository(ctx);
        var items = _faker.Generate(8);
        await ctx.Participation.AddRangeAsync(items);
        await ctx.SaveChangesAsync();

        var filtered = await repo.GetAsync<int>(
            filter: p => p.MatchId == items[0].MatchId,
            selector: p => p.ParticipationId);
        filtered.Should().OnlyContain(id => items.Any(p => p.MatchId == items[0].MatchId && p.ParticipationId == id));

        var paged = await repo.GetAsync<Participation>(skip: 3, take: 2);
        paged.Should().HaveCount(2);
    }
}

