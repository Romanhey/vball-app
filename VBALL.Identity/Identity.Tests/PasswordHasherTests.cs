using FluentAssertions;
using Identity.Infastucture.Services;
using Xunit;

namespace Identity.Tests;

public class PasswordHasherTests
{
    [Fact]
    public void Hash_and_verify_roundtrip()
    {
        var hasher = new PasswordHasher();
        var password = "P@ssw0rd!";

        var hash = hasher.HashPassword(password);

        hash.Should().NotBeNullOrWhiteSpace();
        hash.Should().NotBe(password);
        hasher.VerifyHashedPassword(hash, password).Should().BeTrue();
    }
}

