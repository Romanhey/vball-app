using Schedule.Domain.Entities;

namespace Schedule.Application.DTO.Match;

public record MatchFilterDTO(
    DateTime? FromDate,
    DateTime? ToDate,
    int? TeamId,
    MatchStatus? Status
);