using Schedule.Domain.Entities;

namespace Schedule.Application.DTO.Match
{
    public record UpdateMatchDTO(DateTime StartTime, int TeamAId, int TeamBId, MatchStatus MatchStatus, string FinalScore);
}
