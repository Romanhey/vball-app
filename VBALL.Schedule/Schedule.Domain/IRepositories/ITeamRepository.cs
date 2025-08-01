using Schedule.Domain.Entities;

namespace Schedule.Domain.IRepositories
{
    public interface ITeamRepository: ICrudRepository<Team>, IGetAllRepository<Team>
    {
    }
}
