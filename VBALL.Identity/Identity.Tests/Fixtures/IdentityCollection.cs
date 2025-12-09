using Xunit;

namespace Identity.Tests.Fixtures;

[CollectionDefinition(CollectionName, DisableParallelization = true)]
public class IdentityCollection : ICollectionFixture<IdentityWebApplicationFactory>
{
    public const string CollectionName = "IdentityCollection";
}
