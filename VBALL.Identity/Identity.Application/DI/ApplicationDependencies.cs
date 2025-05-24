using FluentValidation;
using Identity.Application.DTO;
using Identity.Application.MappingProfiles;
using Identity.Application.UseCases.ComandsHandler;
using Identity.Application.UseCases.Validators;
using Microsoft.Extensions.DependencyInjection;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;

namespace Identity.Application.DI;

public static class ApplicationDependencies
{
    public static IServiceCollection AddApplicationDependencies(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(RegisterUserCommandHandler).Assembly));
        services.AddAutoMapper(typeof(UserMappngProfile));
        services.AddFluentValidationAutoValidation();
        services.AddScoped<IValidator<RegisterDTO>, RegisterUserDtoValidation>();

        return services;
    }
}