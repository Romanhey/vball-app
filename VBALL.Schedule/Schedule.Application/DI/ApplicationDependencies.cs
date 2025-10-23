using Microsoft.Extensions.DependencyInjection;
using Schedule.Application.MappingProfiles;
using Schedule.Application.UseCases.Match.CreateMatch;
namespace Schedule.Application.DI;
public static class ApplicationDependencies
{
    public static IServiceCollection AddApplicationService(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateMatchComandHandler).Assembly));
        services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<MatchProfile>();
        });

        return services;
    }
}
