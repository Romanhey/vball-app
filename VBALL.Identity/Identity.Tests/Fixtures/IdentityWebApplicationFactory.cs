using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Identity.Infrastructure.Persistance;
using Identity.Domain.IServices;
using Microsoft.AspNetCore.Http;
using Testcontainers.PostgreSql;

namespace Identity.Tests.Fixtures;

public class IdentityWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:latest")
        .WithDatabase("identity_tests")
        .WithUsername("postgres")
        .WithPassword("postgres")
        .Build();

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Test");
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = _postgres.GetConnectionString(),
                ["JwtSettings:Secret"] = "testsecretvalue1234567890_secret_extended_32chars",
                ["JwtSettings:ExpiryMinutes"] = "60",
                ["JwtSettings:RefreshTokenExpiryDays"] = "2"
            });
        });

        builder.ConfigureServices(services =>
        {
            var dbDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (dbDescriptor != null)
            {
                services.Remove(dbDescriptor);
            }

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(_postgres.GetConnectionString()));

            // Replace cookie service to allow insecure cookies in TestServer
            var cookieDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(ICookieService));
            if (cookieDescriptor != null)
            {
                services.Remove(cookieDescriptor);
            }
            services.AddScoped<ICookieService, TestCookieService>();

            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Database.EnsureCreated();
        });
    }

    public async Task ResetDatabaseAsync()
    {
        await using var scope = Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();
    }

    public new async Task DisposeAsync()
    {
        await _postgres.DisposeAsync();
    }

    private class TestCookieService : ICookieService
    {
        private static readonly CookieOptions DefaultCookieOptions = new()
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        };

        private readonly IHttpContextAccessor _contextAccessor;

        public TestCookieService(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
        }

        public string? GetRequestCookie(string key) => _contextAccessor.HttpContext?.Request.Cookies[key];

        public void AppendResponseCookie(string key, string? value)
        {
            _contextAccessor.HttpContext?.Response.Cookies.Append(key, value ?? string.Empty, DefaultCookieOptions);
        }

        public void DeleteCookie(string key)
        {
            _contextAccessor.HttpContext?.Response.Cookies.Delete(key);
        }
    }
}

