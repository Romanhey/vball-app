using AutoMapper;
using Schedule.Application.DTO.Participation;
using Schedule.Application.UseCases.Participation.CreateParticipation;
using Schedule.Application.UseCases.Participation.UpdateParticipation;
using Schedule.Domain.Entities;

namespace Schedule.Application.MappingProfiles
{
    public class ParticipationProfile : Profile
    {
        public ParticipationProfile() 
        {
            CreateMap<CreateParticipationDTO, CreateParticipationCommand>()
                .ConstructUsing(dto => new CreateParticipationCommand(dto));
            CreateMap<CreateParticipationCommand, Participation>()
                .ForMember(dest => dest.MatchId, opt => opt.MapFrom(src => src.ParticipationDTO.MatchId))
                .ForMember(dest => dest.PlayerId, opt => opt.MapFrom(src => src.ParticipationDTO.PlayerId));
            CreateMap<Participation, ParticipationResponseDTO>();
            CreateMap<(int participationId, UpdateParticipationDTO dto), UpdateParticipationCommand>()
                .ConstructUsing(src => new UpdateParticipationCommand(src.participationId, src.dto));
        }
    }
}
