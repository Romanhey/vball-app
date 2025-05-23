using Identity.Application.UseCases.ComandsHandler;
using Microsoft.Extensions.DependencyInjection;

namespace Identity.Application.DI;

public static class ApplicationDependencies
{
    public static IServiceCollection AddApplicationDependencies(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(RegisterUserCommandHandler).Assembly));

        return services;
    }
}