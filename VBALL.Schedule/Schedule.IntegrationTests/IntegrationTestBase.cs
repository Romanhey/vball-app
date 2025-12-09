using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Schedule.Infrastructure.Persistence;
using Schedule.IntegrationTests.Fixtures;

namespace Schedule.IntegrationTests;

[Collection(ScheduleCollection.CollectionName)]
public abstract class IntegrationTestBase
{
    protected IntegrationTestBase(ScheduleWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }

    protected ScheduleWebApplicationFactory Factory { get; }
    protected HttpClient Client { get; }

    protected static StringContent JsonContent<T>(T value) =>
        new(JsonSerializer.Serialize(value), Encoding.UTF8, "application/json");

    protected async Task ResetDatabaseAsync()
    {
        await Factory.ResetDatabaseAsync();
    }

    protected IServiceScope CreateScope() => Factory.Services.CreateScope();
}
