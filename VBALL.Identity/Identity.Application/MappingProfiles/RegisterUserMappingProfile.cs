using AutoMapper;
using Identity.Application.DTO;
using Identity.Domain.Entities;
using Identity.Domain.IServices;

namespace Identity.Application.MappingProfiles
{
    public class RegisterUserMappingProfile : Profile
    {
        public RegisterUserMappingProfile() => CreateMap<RegisterDTO, User>()
                .ForMember
                (
                    dest => dest.Id,
                    opt => opt.Ignore()
                )
                .ForMember
                (
                    dest => dest.Password,
                    opt => opt.MapFrom((src, dest, member, context) =>
                    ((IPasswordHasher)context.Items["PasswordHasher"]).HashPassword(src.Password))
                );
    }
}
