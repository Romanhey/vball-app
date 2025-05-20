namespace Identity.Domain.Entities
{
    public class RefreshTokenModel
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        public string? RefreshToken { get; set; }

        public DateTime RefreshTokenExpireDate { get; set; }

        public User? User { get; set; }
    }

}
