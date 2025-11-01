using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Schedule.Domain.IRepositories;
using Schedule.Infrastructure.Persistence;
using Schedule.Infrastructure.Persistence.Repositories;

namespace Schedule.Infrastructure.DI
{
    public static class InfrastructureDependencies
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(op =>
                op.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IMatchRepository, MatchRepository>();
            services.AddScoped<IParticipationRepository, ParticipationRepository>();
            services.AddScoped<ITeamAssignmentRepository, TeamAssignmentRepository>();
            services.AddScoped<ITeamRepository, TeamRepository>();

            return services;
        }

        public static void ApplyDatabaseMigration(this IHost host)
        {
            using var scope = host.Services.CreateScope();

            var services = scope.ServiceProvider;

            var context = services.GetRequiredService<ApplicationDbContext>();

            if (context.Database.GetPendingMigrations().Any())
            {
                context.Database.Migrate();
            }
        }
    }
}
