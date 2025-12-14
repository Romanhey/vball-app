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
            CreateMap<CreateParticipationDTO, Participation>()
                .ForMember(dest => dest.ParticipationId, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            CreateMap<Participation, ParticipationResponseDTO>();
            CreateMap<(int participationId, UpdateParticipationDTO dto), UpdateParticipationCommand>()
                .ConstructUsing(src => new UpdateParticipationCommand(src.participationId, src.dto));
            CreateMap<CreateParticipationDTO, CreateParticipationCommand>()
                .ConstructUsing(dto => new CreateParticipationCommand(dto));
        }
    }
}
