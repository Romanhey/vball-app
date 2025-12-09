using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Identity.Tests.Fixtures;

namespace Identity.Tests;

public class AuthControllerTests(IdentityWebApplicationFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task Auth_endpoints_register_login_and_refresh()
    {
        await ResetDatabaseAsync();

        var registerPayload = new
        {
            email = "user@test.local",
            name = "Test User",
            password = "P@ssw0rd!",
            passwordRepeat = "P@ssw0rd!"
        };

        var registerResponse = await Client.PostAsync("/api/Auth/register", JsonContent(registerPayload));
        registerResponse.EnsureSuccessStatusCode();

        var loginPayload = new { email = registerPayload.email, password = registerPayload.password };
        var loginResponse = await Client.PostAsync("/api/Auth/login", JsonContent(loginPayload));
        loginResponse.EnsureSuccessStatusCode();

        var loginBody = await loginResponse.Content.ReadAsStringAsync();
        var loginResult = JsonSerializer.Deserialize<LoginResult>(loginBody, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        loginResult.Should().NotBeNull();
        loginResult!.AccesToken.Should().NotBeNullOrWhiteSpace();

        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginResult.AccesToken);

        var refreshResponse = await Client.PostAsync("/api/Auth/refresh-token", null);
        refreshResponse.EnsureSuccessStatusCode();

        var refreshedToken = await refreshResponse.Content.ReadAsStringAsync();
        refreshedToken.Should().NotBeNullOrWhiteSpace();
    }

    private record LoginResult(string AccesToken);
}
