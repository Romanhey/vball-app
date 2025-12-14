using Identity.Domain.IRepository;
using Identity.Domain.IServices;
using Identity.Infastucture.Persistance;
using Identity.Infastucture.Persistance.Repositories;
using Identity.Infastucture.Services;
using Identity.Infrastructure.Persistance;
using Identity.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Identity.Infrastructure.DI
{
    public static class InfrastructureDependencies
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(op =>
                op.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IJwtService, JWTService>();
            services.AddScoped<IPasswordHasher, PasswordHasher>();
            services.AddScoped<ICookieService, CookieService>();
            
            return services;
        }
        public static void ApplyDatabaseMigration(this IHost host)
        {
            const int maxRetries = 10;
            const int delayMs = 2000;
            var attempt = 0;

            while (true)
            {
                using var scope = host.Services.CreateScope();
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<ApplicationDbContext>();

                try
                {
                    if (context.Database.GetPendingMigrations().Any())
                    {
                        context.Database.Migrate();
                    }
                    break;
                }
                catch (Exception ex)
                {
                    attempt++;
                    if (attempt >= maxRetries)
                    {
                        throw new Exception("Exceeded max retry attempts to connect to DB", ex);
                    }

                    Console.WriteLine($"[MIGRATION RETRY] attempt {attempt}/{maxRetries} failed, retrying in {delayMs / 1000.0}s...");
                    Thread.Sleep(delayMs);
                }
            }
        }
    }
}
