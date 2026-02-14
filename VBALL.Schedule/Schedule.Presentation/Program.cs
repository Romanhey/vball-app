using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Schedule.Application.DI;
using Schedule.Infrastructure.DI;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrEmpty(origin)) return true; // Native apps (no Origin header)
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri) || !uri.IsAbsoluteUri) return false;
                var host = uri.Host;
                return host == "localhost" || host == "127.0.0.1"
                    || host.StartsWith("192.168.") || host.StartsWith("10.")
                    || (host.StartsWith("172.") && IsPrivateClassB(host));
            })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

builder.Services.AddInfrastructureService(builder.Configuration);
builder.Services.AddApplicationService();
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]!))
    };
});
builder.Services.AddAuthorization();
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsEnvironment("Test"))
{
    await app.ApplyDatabaseMigrationAsync();
}

app.UseCors();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

static bool IsPrivateClassB(string host)
{
    if (!host.StartsWith("172.")) return false;
    var parts = host.Split('.');
    if (parts.Length < 2 || !int.TryParse(parts[1], out var second)) return false;
    return second >= 16 && second <= 31;
}

public partial class Program { }
