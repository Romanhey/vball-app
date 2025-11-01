using MediatR;
using Schedule.Application.DTO.Participation;
using Schedule.Domain.Entities;

namespace Schedule.Application.UseCases.Participation.UpdateParticipation;
    public record UpdateParticipationCommand(int participationId, UpdateParticipationDTO dto):IRequest;
    
