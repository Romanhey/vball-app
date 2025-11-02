using AutoMapper;
using Schedule.Application.DTO.Team;
using Schedule.Application.UseCases.Team.CreateTeam;
using Schedule.Application.UseCases.Team.UpdateTeam;
using Schedule.Domain.Entities;

namespace Schedule.Application.MappingProfiles
{
    public class TeamProfile : Profile
    {
        public TeamProfile()
        {
            CreateMap<CreateTeamDTO, CreateTeamCommand>()
                .ConstructUsing(dto => new CreateTeamCommand(dto));
            CreateMap<CreateTeamCommand, Team>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Dto.Name));
            CreateMap<(int teamId, UpdateTeamDTO dto), UpdateTeamCommand>()
                .ConstructUsing(src => new UpdateTeamCommand(src.teamId, src.dto));
        }
    }
}
