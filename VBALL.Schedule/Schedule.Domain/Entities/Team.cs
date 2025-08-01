using System.ComponentModel.DataAnnotations;

namespace Schedule.Domain.Entities
{
    public class Team
    {
        [Key]
        public required int TeamId { get; set; }
        public required string Name { get; set; }
        public required double Rating { get; set; }
    }
}
