using Schedule.Domain.Entities;

namespace Schedule.Domain.IRepositories
{
    public interface IParticipationRepository: ICrudRepository<Participation>, IGetAllRepository<Participation>
    {
    }
}
