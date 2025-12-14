using System.Collections.Generic;
using FluentAssertions;
using Identity.Domain.Entities;
using Identity.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Identity.Tests;

public class JwtServiceTests
{
    [Fact]
    public void GenerateJwtToken_returns_token_string()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:Secret"] = "super_secret_key_that_is_long_enough_32chars",
                ["JwtSettings:ExpiryMinutes"] = "60"
            })
            .Build();

        var service = new JWTService(config);
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            Name = "Test User",
            Password = "hash",
            IsAdmin = false
        };

        var token = service.GenerateJwtToken(user);

        token.Should().NotBeNullOrWhiteSpace();
        token.Split('.').Length.Should().Be(3); // header.payload.signature
    }
}

