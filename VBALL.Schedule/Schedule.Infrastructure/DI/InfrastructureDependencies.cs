using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Schedule.Domain.IRepositories;
using Schedule.Domain.Services;
using Schedule.Infrastructure.Persistence;
using Schedule.Infrastructure.Persistence.Repositories;
using Schedule.Infrastructure.Options;
using Schedule.Infrastructure.Protos;
using Schedule.Infrastructure.RpcServices;
using System.Net.Http;

namespace Schedule.Infrastructure.DI
{
    public static class InfrastructureDependencies
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration configuration)
        {
            AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);

            services.AddDbContext<ApplicationDbContext>(op =>
                op.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IMatchRepository, MatchRepository>();
            services.AddScoped<IParticipationRepository, ParticipationRepository>();
            services.AddScoped<ITeamRepository, TeamRepository>();
            services.Configure<NotificationGrpcOptions>(configuration.GetSection(NotificationGrpcOptions.SectionName));

            services
                .AddGrpcClient<NotificationGrpcService.NotificationGrpcServiceClient>((sp, options) =>
                {
                    var grpcOptions = sp.GetRequiredService<IOptions<NotificationGrpcOptions>>().Value;

                    if (string.IsNullOrWhiteSpace(grpcOptions.Address))
                    {
                        throw new InvalidOperationException("NotificationGrpc:Address is not configured.");
                    }

                    options.Address = new Uri(grpcOptions.Address);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
                {
                    EnableMultipleHttp2Connections = true
                });

            services.AddScoped<INotificationService, NotificationGrpcClient>();

            return services;
        }

        public static async Task ApplyDatabaseMigrationAsync(this IHost host)
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
                    if (!context.Database.CanConnect())
                    {
                        throw new Exception("Cannot connect to database");
                    }

                    var pendingMigrations = context.Database.GetPendingMigrations().ToList();
                    if (pendingMigrations.Any())
                    {
                        Console.WriteLine($"[MIGRATION] Applying {pendingMigrations.Count} pending migration(s)...");
                        context.Database.Migrate();
                        Console.WriteLine($"[MIGRATION] Migrations applied successfully.");
                    }
                    else
                    {
                        Console.WriteLine($"[MIGRATION] Database is up to date.");
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
                    await Task.Delay(delayMs);
                }
            }
        }
    }
}
