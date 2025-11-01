namespace Schedule.Application.DTO.Match
{
    public record CreateMatchDTO(DateTime StartTime, int TeamAId, int TeamBId);
}
