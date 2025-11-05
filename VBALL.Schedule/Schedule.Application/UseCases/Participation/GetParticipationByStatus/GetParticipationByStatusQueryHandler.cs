using AutoMapper;
using MediatR;
using Schedule.Application.DTO.Participation;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.GetParticipationByStatus;

public class GetParticipationByStatusQueryHandler(
    IUnitOfWork unitOfWork,
    IMapper mapper
    ) : IRequestHandler<GetParticipationByStatusQuery, List<ParticipationResponseDTO>>
{
    public async Task<List<ParticipationResponseDTO>> Handle(GetParticipationByStatusQuery request, CancellationToken cancellationToken)
    {
        var participation = await unitOfWork.ParticipationRepository.GetByStatusAsync(request.Status, cancellationToken);
        
        return mapper.Map<List<ParticipationResponseDTO>>(participation);
    }
}
