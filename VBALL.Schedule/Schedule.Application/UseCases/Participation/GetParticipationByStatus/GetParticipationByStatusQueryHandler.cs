using AutoMapper;
using FluentValidation;
using MediatR;
using Schedule.Application.DTO.Participation;
using Schedule.Application.Exceptions;
using Schedule.Domain.IRepositories;

namespace Schedule.Application.UseCases.Participation.GetParticipationByStatus;

public class GetParticipationByStatusQueryHandler(
    IUnitOfWork unitOfWork,
    IMapper mapper,
    IValidator<GetParticipationByStatusQuery> validator
    ) : IRequestHandler<GetParticipationByStatusQuery, List<ParticipationResponseDTO>>
{
    public async Task<List<ParticipationResponseDTO>> Handle(GetParticipationByStatusQuery request, CancellationToken cancellationToken)
    {
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new BadRequestException(string.Join(", ", validationResult.Errors));
        }
        var participation = await unitOfWork.ParticipationRepository.GetByStatusAsync(request.Status, cancellationToken);

        return mapper.Map<List<ParticipationResponseDTO>>(participation);
    }
}
