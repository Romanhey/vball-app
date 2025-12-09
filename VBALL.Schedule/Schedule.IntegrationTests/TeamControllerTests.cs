using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Schedule.Infrastructure.Persistence;
using Schedule.IntegrationTests.Fixtures;

namespace Schedule.IntegrationTests;

public class TeamControllerTests(ScheduleWebApplicationFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task Team_endpoints_cover_full_lifecycle()
    {
        await ResetDatabaseAsync();

        var createDto = new { name = "Spikers", rating = 9.5 };
        var createResponse = await Client.PostAsync("/api/Team", JsonContent(createDto));
        createResponse.EnsureSuccessStatusCode();

        int teamId;
        using (var scope = CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            teamId = db.Teams.Single().TeamId;
        }

        var getResponse = await Client.GetAsync($"/api/Team/{teamId}");
        getResponse.EnsureSuccessStatusCode();

        var updateDto = new { name = "Power Spikers", rating = 9.8 };
        var updateResponse = await Client.PutAsync($"/api/Team/{teamId}", JsonContent(updateDto));
        updateResponse.EnsureSuccessStatusCode();

        var listResponse = await Client.GetAsync("/api/Team?skip=0&take=10");
        listResponse.EnsureSuccessStatusCode();
        var listJson = await listResponse.Content.ReadAsStringAsync();
        listJson.Should().Contain("Power Spikers");

        var playersResponse = await Client.GetAsync($"/api/Team/{teamId}/players");
        playersResponse.EnsureSuccessStatusCode();

        var matchesResponse = await Client.GetAsync($"/api/Team/{teamId}/matches");
        matchesResponse.EnsureSuccessStatusCode();

        var deleteResponse = await Client.DeleteAsync($"/api/Team/{teamId}");
        deleteResponse.EnsureSuccessStatusCode();
    }
}

