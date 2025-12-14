using Schedule.Domain.Entities;

namespace Schedule.Application.DTO.Participation;

public record ParticipationFilterDTO(
    int? ParticipationId,
    int? MatchId,
    int? PlayerId,
    int? TeamId,
    DateTime? CreatedFrom,
    DateTime? CreatedTo,
    ParticipationStatus? Status
);
