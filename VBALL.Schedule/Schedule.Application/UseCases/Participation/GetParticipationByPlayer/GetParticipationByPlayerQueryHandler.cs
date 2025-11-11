using AutoMapper;
using MediatR;
using Schedule.Application.DTO.Participation;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.GetParticipationByPlayer;

public class GetParticipationByPlayerQueryHandler(
    IUnitOfWork unitOfWork,
    IMapper mapper
    ) : IRequestHandler<GetParticipationByPlayerQuery, List<ParticipationResponseDTO>>
{
    public async Task<List<ParticipationResponseDTO>> Handle(GetParticipationByPlayerQuery request, CancellationToken cancellationToken)
    {
        // Validation handled by FluentValidation AutoValidation
        var participation = await unitOfWork.ParticipationRepository.GetByPlayerAsync(request.PlayerId, cancellationToken);

        return mapper.Map<List<ParticipationResponseDTO>>(participation);
    }
}
