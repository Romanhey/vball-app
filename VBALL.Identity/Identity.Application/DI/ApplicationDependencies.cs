using FluentValidation;
using Identity.Application.MappingProfiles;
using Identity.Application.UseCases.Commands.LoginUser;
using Identity.Application.UseCases.Commands.RegisterUser;
using Microsoft.Extensions.DependencyInjection;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;

namespace Identity.Application.DI;

public static class ApplicationDependencies
{
    public static IServiceCollection AddApplicationDependencies(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(RegisterUserCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(LoginUserCommandHandler).Assembly));
        services.AddAutoMapper(typeof(RegisterUserMappingProfile));
        services.AddAutoMapper(typeof(LoginResponseMappingProfile));
        services.AddFluentValidationAutoValidation();
        services.AddScoped<IValidator<RegisterUserCommand>, RegisterUserCommandValidation>();
        services.AddScoped<IValidator<LoginUserCommand>, LoginUserCommandValidation>();

        return services;
    }
}