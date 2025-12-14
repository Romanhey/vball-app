using AutoMapper;
using MediatR;
using Schedule.Application.DTO.Participation;
using Schedule.Application.Exceptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.GetParticipation
{
    public class GetParticipationCommandHandler(
        IUnitOfWork unitOfWork,
        IMapper mapper
        ) : IRequestHandler<GetParticipationQuery, ParticipationResponseDTO>
    {
        public async Task<ParticipationResponseDTO> Handle(GetParticipationQuery request, CancellationToken cancellationToken)
        {
            var participation = await unitOfWork.ParticipationRepository.GetByIdAsync(request.ParticipationId, cancellationToken);

            if (participation is null) throw new NotFoundException("Participation not found");

            return mapper.Map<ParticipationResponseDTO>(participation);
        }
    }
}
