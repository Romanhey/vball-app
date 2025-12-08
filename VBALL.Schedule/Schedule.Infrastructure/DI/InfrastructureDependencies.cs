using System;
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
