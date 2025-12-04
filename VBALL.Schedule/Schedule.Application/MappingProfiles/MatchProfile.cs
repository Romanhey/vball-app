using AutoMapper;
using Schedule.Application.DTO.Match;
using Schedule.Application.UseCases.Match;
using Schedule.Application.UseCases.Match.UpdateMatch;
using Schedule.Domain.Entities;

namespace Schedule.Application.MappingProfiles
{
    public class MatchProfile : Profile
    {
        public MatchProfile()
        {

            CreateMap<CreateMatchDTO, CreateMatchCommand>()
                .ConstructUsing(x => new CreateMatchCommand(x));
            CreateMap<CreateMatchCommand, Match>()
                .ForMember(dest => dest.StartTime, opt => opt.MapFrom(x => x.MatchDTO.StartTime))
                .ForMember(dest => dest.TeamAId, opt => opt.MapFrom(x => x.MatchDTO.TeamAId))
                .ForMember(dest => dest.TeamBId, opt => opt.MapFrom(x => x.MatchDTO.TeamBId));
            CreateMap<(int id, UpdateMatchDTO), UpdateMatchCommand>()
                .ConstructUsing(src => new UpdateMatchCommand(src.id, src.Item2));
            CreateMap<CreateMatchDTO, Match>()
                .ForMember(dest => dest.Status, opt => opt.Ignore()); // Status будет задаваться вручную
        }
    }
}

