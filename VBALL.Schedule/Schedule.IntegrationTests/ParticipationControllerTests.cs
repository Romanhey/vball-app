using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Schedule.Domain.Entities;
using Schedule.Infrastructure.Persistence;
using Schedule.IntegrationTests.Fixtures;

namespace Schedule.IntegrationTests;

public class ParticipationControllerTests(ScheduleWebApplicationFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task Participation_endpoints_cover_all_paths()
    {
        await ResetDatabaseAsync();

        // Seed teams to satisfy validation
        var teamA = new { name = "TeamA", rating = 8.0 };
        var teamB = new { name = "TeamB", rating = 7.5 };
        (await Client.PostAsync("/api/Team", JsonContent(teamA))).EnsureSuccessStatusCode();
        (await Client.PostAsync("/api/Team", JsonContent(teamB))).EnsureSuccessStatusCode();

        var matchDto = new { startTime = DateTime.UtcNow.AddDays(2), teamAId = 1, teamBId = 2 };
        (await Client.PostAsync("/api/Match", JsonContent(matchDto))).EnsureSuccessStatusCode();

        int matchId;
        using (var scope = CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            matchId = db.Matches.Single().MatchId;
        }

        // Participant 1: review -> approve -> confirm -> admin-cancel
        (await Client.PostAsync("/api/Participation", JsonContent(new { matchId, playerId = 101 }))).EnsureSuccessStatusCode();
        var p1 = GetParticipationId(101);

        (await Client.PostAsync($"/api/Participation/{p1}/review", null)).EnsureSuccessStatusCode();
        (await Client.PostAsync($"/api/Participation/{p1}/approve", null)).EnsureSuccessStatusCode();
        (await Client.PostAsync($"/api/Participation/{p1}/confirm", JsonContent(matchDto.teamAId))).EnsureSuccessStatusCode();
        (await Client.PostAsync($"/api/Participation/{p1}/admin-cancel", JsonContent(new { cancellationType = CancellationType.AdminDecision.ToString(), reason = "admin cancel" }))).EnsureSuccessStatusCode();

        // Participant 2: waitlist flow -> approve -> request/approve cancellation
        (await Client.PostAsync("/api/Participation", JsonContent(new { matchId, playerId = 102 }))).EnsureSuccessStatusCode();
        var p2 = GetParticipationId(102);

        SetStatus(p2, ParticipationStatus.Waitlisted);
        (await Client.PostAsync($"/api/Participation/{p2}/review-waitlisted", null)).EnsureSuccessStatusCode();
        (await Client.PostAsync($"/api/Participation/{p2}/approve", null)).EnsureSuccessStatusCode();
        (await Client.PostAsync($"/api/Participation/{p2}/request-cancellation", JsonContent(new { reason = "cannot play" }))).EnsureSuccessStatusCode();
        (await Client.PostAsync($"/api/Participation/{p2}/approve-cancellation", null)).EnsureSuccessStatusCode();

        // Participant 3: cancellation rejected path then deletion
        (await Client.PostAsync("/api/Participation", JsonContent(new { matchId, playerId = 103 }))).EnsureSuccessStatusCode();
        var p3 = GetParticipationId(103);

        (await Client.PostAsync($"/api/Participation/{p3}/review", null)).EnsureSuccessStatusCode();
        (await Client.PostAsync($"/api/Participation/{p3}/approve", null)).EnsureSuccessStatusCode();
        (await Client.PostAsync($"/api/Participation/{p3}/request-cancellation", JsonContent(new { reason = "change of plans" }))).EnsureSuccessStatusCode();
        (await Client.PostAsync($"/api/Participation/{p3}/reject-cancellation", null)).EnsureSuccessStatusCode();
        (await Client.DeleteAsync($"/api/Participation/{p3}")).EnsureSuccessStatusCode();

        var listResponse = await Client.GetAsync("/api/Participation?skip=0&take=10");
        listResponse.EnsureSuccessStatusCode();
        var listJson = await listResponse.Content.ReadAsStringAsync();
        listJson.Should().Contain("participationId");
    }

    private int GetParticipationId(int playerId)
    {
        using var scope = CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        return db.Participation.Single(p => p.PlayerId == playerId).ParticipationId;
    }

    private void SetStatus(int participationId, ParticipationStatus status)
    {
        using var scope = CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var p = db.Participation.Single(x => x.ParticipationId == participationId);
        p.Status = status;
        p.UpdatedAt = DateTime.UtcNow;
        db.SaveChanges();
    }
}
