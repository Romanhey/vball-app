using Microsoft.Extensions.DependencyInjection;
using Schedule.Application.MappingProfiles;
using Schedule.Application.UseCases.Match.CreateMatch;
using Schedule.Application.UseCases.Participation.CreateParticipation;
using Schedule.Application.UseCases.Team.CreateTeam;
namespace Schedule.Application.DI;
public static class ApplicationDependencies
{
    public static IServiceCollection AddApplicationService(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateMatchCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateParticipationCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateTeamCommandHandler).Assembly));
        services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<MatchProfile>();
            cfg.AddProfile<ParticipationProfile>();
        });

        return services;
    }
}
