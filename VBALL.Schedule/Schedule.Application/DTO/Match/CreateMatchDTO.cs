using Schedule.Domain.Entities;

namespace Schedule.Application.DTO.Match
{
    public record CreateMatchDTO(DateTime StartTime, int TeamAId, int TeamBId, MatchStatus MatchStatus = MatchStatus.Scheduled);
}
