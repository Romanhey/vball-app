using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Identity.Tests.Fixtures;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Identity.Tests;

[Collection(IdentityCollection.CollectionName)]
public abstract class IntegrationTestBase
{
    protected IntegrationTestBase(IdentityWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }

    protected IdentityWebApplicationFactory Factory { get; }
    protected HttpClient Client { get; }

    protected static StringContent JsonContent<T>(T value) =>
        new(JsonSerializer.Serialize(value), Encoding.UTF8, "application/json");

    protected Task ResetDatabaseAsync() => Factory.ResetDatabaseAsync();
}

