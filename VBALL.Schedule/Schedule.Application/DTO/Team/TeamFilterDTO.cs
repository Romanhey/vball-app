namespace Schedule.Application.DTO.Team;

public record TeamFilterDTO(
    int? TeamId,
    string? Name,
    double? MinRating,
    double? MaxRating
);
