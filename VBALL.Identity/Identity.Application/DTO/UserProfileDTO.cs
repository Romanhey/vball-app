namespace Identity.Application.DTO
{
    public class UserProfileDTO
    {
        public required int Id { get; init; }
        public required string Email { get; init; }
        public required string Name { get; init; }
        public required bool IsAdmin { get; init; }
        public string Role => IsAdmin ? "Admin" : "Player";
    }
}

