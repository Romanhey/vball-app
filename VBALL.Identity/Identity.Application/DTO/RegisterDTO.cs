namespace Identity.Application.DTO
{
    public class RegisterDTO
    {
        public required string Email { get; set; }
        public required string Name { get; set; }
        public required string Password { get; set; }
        public required string PasswordRepeat { get; init; }
    }
}
