using Schedule.Domain.Entities;

namespace Schedule.Application.DTO.Participation
{
    public class ParticipationResponseDTO
    {
        public required int ParticipationId { get; init; }
        public required int MatchId { get; init; }
        public required int PlayerId { get; init; }
        public required DateTime CreatedAt { get; init; }
        public DateTime? UpdatedAt { get; init; }
        public required ParticipationStatus Status { get; init; }
    }
}
