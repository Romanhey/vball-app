using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Identity.Domain.Entities
{
    public class User
    {
        [Key]
        public required int Id { get; set; }
        public required string Email { get; set; }
        public required string Name { get; set; }
        public required string Password { get; set; }
        public required bool IsAdmin { get; set; }
    }
}
