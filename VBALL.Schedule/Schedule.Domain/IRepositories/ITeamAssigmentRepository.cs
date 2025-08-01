using Schedule.Domain.Entities;

namespace Schedule.Domain.IRepositories
{
    public interface ITeamAssigmentRepository: ICrudRepository<TeamAssigment>, IGetAllRepository<TeamAssigment>
    {
    }
}
