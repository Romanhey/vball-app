using AutoMapper;
using FluentValidation;
using MediatR;
using Schedule.Application.DTO.Participation;
using Schedule.Application.Exceptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.GetParticipationByPlayer;

public class GetParticipationByPlayerQueryHandler(
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IValidator<GetParticipationByPlayerQuery> validator
    ) : IRequestHandler<GetParticipationByPlayerQuery, List<ParticipationResponseDTO>>
{
    public async Task<List<ParticipationResponseDTO>> Handle(GetParticipationByPlayerQuery request, CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new BadRequestException(string.Join(", ", validationResult.Errors));
        }
        var participation = await unitOfWork.ParticipationRepository.GetByPlayerAsync(request.PlayerId, cancellationToken);

        return mapper.Map<List<ParticipationResponseDTO>>(participation);
    }
}
