using Schedule.Domain.Entities;

namespace Schedule.Application.DTO.Participation
{
    public class ParticipationResponseDTO
    {
        public int ParticipationId { get; set; }
        public int MatchId { get; set; }
        public int PlayerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public ParticipationStatus Status { get; set; }
    }
}
