using Xunit;

namespace Schedule.IntegrationTests.Fixtures;

[CollectionDefinition(CollectionName, DisableParallelization = true)]
public class ScheduleCollection : ICollectionFixture<ScheduleWebApplicationFactory>
{
    public const string CollectionName = "ScheduleCollection";
}

