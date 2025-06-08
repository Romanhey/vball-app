using Identity.Domain.IRepository;
using Identity.Domain.IServices;
using Identity.Infastucture.Persistance;
using Identity.Infastucture.Persistance.Repositories;
using Identity.Infastucture.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using System.Text;


namespace Identity.Infastucture.DI
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
    }
}
