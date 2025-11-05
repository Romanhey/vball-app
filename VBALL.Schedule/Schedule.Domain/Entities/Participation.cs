using System.ComponentModel.DataAnnotations;

namespace Schedule.Domain.Entities
{
    public class Participation
    {
        [Key]
        public required int ParticipationId { get; set; }
        public required int MatchId { get; set; }
        public required int PlayerId { get; set; }
        public required DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public required ParticipationStatus Status { get; set; }
        public string? CancellationReason { get; set; }
    }
}
