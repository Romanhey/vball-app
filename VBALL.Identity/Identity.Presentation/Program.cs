using System.Text.Json.Serialization;
using Identity.Application.DI;
using Identity.Infrastructure.DI;
using Presentation.DI;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "http://localhost",
                "http://localhost:80",
                "https://localhost:80",
                "http://localhost:3000",
                "https://localhost:3000",
                "http://127.0.0.1",
                "http://127.0.0.1:3000"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

builder.Services.AddInfrastructureService(builder.Configuration);
builder.Services.AddApplicationDependencies();
builder.Services.AddPresentationDependencies(builder.Configuration);
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger(c =>
    {
        c.RouteTemplate = "swagger/{documentName}/swagger.json";
    });
    app.UseSwaggerUI(c =>
    {
        // Use relative path - nginx will handle the /identity prefix
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Identity API v1");
        c.RoutePrefix = "swagger";
        // Configure Swagger UI to work behind reverse proxy
        c.ConfigObject.AdditionalItems.Add("persistAuthorization", "true");
        // Enable deep linking
        c.EnableDeepLinking();
        // Display operation ID
        c.DisplayOperationId();
    });
}
app.ApplyDatabaseMigration();

// CORS must be before other middleware
app.UseCors();
// Skip HTTPS redirection in development when behind nginx
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
