using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Schedule.Application.Behaviors;
using Schedule.Application.MappingProfiles;
using Schedule.Application.UseCases.Match.CreateMatch;
using Schedule.Application.UseCases.Participation.CreateParticipation;
using Schedule.Application.UseCases.Team.CreateTeam;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;

namespace Schedule.Application.DI;

public static class ApplicationDependencies
{
    public static IServiceCollection AddApplicationService(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(CreateMatchCommandHandler).Assembly);
            cfg.RegisterServicesFromAssembly(typeof(CreateParticipationCommandHandler).Assembly);
            cfg.RegisterServicesFromAssembly(typeof(CreateTeamCommandHandler).Assembly);

            // Register ValidationBehavior for all requests
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));

            // Register entity existence validation behaviors
            cfg.AddOpenBehavior(typeof(FinishedMatchValidationBehavior<,>)); // For IParticipationCommand
            cfg.AddOpenBehavior(typeof(TeamExistenceValidationBehavior<,>)); // For ITeamCommand
            cfg.AddOpenBehavior(typeof(MatchExistenceValidationBehavior<,>)); // For IMatchCommand
        });

        services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<MatchProfile>();
            cfg.AddProfile<ParticipationProfile>();
            cfg.AddProfile<TeamProfile>();
        });

        services.AddValidatorsFromAssembly(typeof(CreateParticipationCommandHandler).Assembly);

        // Optional: keep for controller-level validation, or remove if only using MediatR pipeline
        services.AddFluentValidationAutoValidation();

        return services;
    }
}
