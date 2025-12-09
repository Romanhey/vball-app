using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Schedule.Infrastructure.Persistence;
using Schedule.IntegrationTests.Fixtures;

namespace Schedule.IntegrationTests;

public class MatchControllerTests(ScheduleWebApplicationFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task Match_endpoints_cover_full_lifecycle()
    {
        await ResetDatabaseAsync();

        // Seed teams to satisfy validation
        var teamA = new { name = "TeamA", rating = 8.5 };
        var teamB = new { name = "TeamB", rating = 7.2 };
        (await Client.PostAsync("/api/Team", JsonContent(teamA))).EnsureSuccessStatusCode();
        (await Client.PostAsync("/api/Team", JsonContent(teamB))).EnsureSuccessStatusCode();

        var createDto = new
        {
            startTime = DateTime.UtcNow.AddDays(2),
            teamAId = 1,
            teamBId = 2
        };

        var createResponse = await Client.PostAsync("/api/Match", JsonContent(createDto));
        createResponse.EnsureSuccessStatusCode();

        int matchId;
        using (var scope = CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            matchId = db.Matches.Single().MatchId;

            // Seed confirmed participations to satisfy start rules
            for (var i = 0; i < 14; i++)
            {
                db.Participation.Add(new Schedule.Domain.Entities.Participation
                {
                    ParticipationId = i + 1,
                    MatchId = matchId,
                    PlayerId = 1000 + i,
                    TeamId = i < 7 ? 1 : 2,
                    CreatedAt = DateTime.UtcNow,
                    Status = Schedule.Domain.Entities.ParticipationStatus.Confirmed
                });
            }
            db.SaveChanges();
        }

        var getResponse = await Client.GetAsync($"/api/Match/{matchId}");
        getResponse.EnsureSuccessStatusCode();
        var matchJson = await getResponse.Content.ReadAsStringAsync();
        matchJson.Should().NotBeNullOrWhiteSpace();

        var startResponse = await Client.PutAsync($"/api/Match/{matchId}/start", null);
        startResponse.EnsureSuccessStatusCode();

        var finishResponse = await Client.PutAsync($"/api/Match/{matchId}/finish", JsonContent("25:20"));
        finishResponse.EnsureSuccessStatusCode();

        var listResponse = await Client.GetAsync("/api/Match?skip=0&take=10");
        listResponse.EnsureSuccessStatusCode();
        var listJson = await listResponse.Content.ReadAsStringAsync();
        listJson.Should().Contain("teamAId");

    }
}
