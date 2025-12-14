using Schedule.Domain.Entities;

namespace Schedule.Domain.IRepositories
{
    public interface IMatchRepository: ICrudRepository<Match>, IGetAllRepository<Match>, IPaginationRepository<Match>
    {
    }
}
