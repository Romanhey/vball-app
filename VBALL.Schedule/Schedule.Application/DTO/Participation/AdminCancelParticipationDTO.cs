using Schedule.Domain.Entities;

namespace Schedule.Application.DTO.Participation
{
    public record AdminCancelParticipationDTO(CancellationType CancellationType, string Reason);
}
