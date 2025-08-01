using AutoMapper;
using Identity.Application.DTO;
using Identity.Domain.Entities;

namespace Identity.Application.MappingProfiles
{
    public class LoginResponseMappingProfile: Profile
    {
        public LoginResponseMappingProfile() => CreateMap<User, LoginUserResponseDTO>()
                .ForMember
                (
                    dest => dest.AccesToken,
                    opt => opt.Ignore()
                );
    }
}
