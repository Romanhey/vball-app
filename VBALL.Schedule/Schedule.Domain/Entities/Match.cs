using System.ComponentModel.DataAnnotations;

namespace Schedule.Domain.Entities
{
    public class Match
    {
        [Key]
        public required int MatchId {  get; set; }
        public required DateTime StartTime { get; set; }
        public required int TeamAId { get; set; }
        public required int TeamBId { get; set; }
        public required MatchStatus Status {  get; set; }
        public string? FinalScore { get; set; }
    }
}
