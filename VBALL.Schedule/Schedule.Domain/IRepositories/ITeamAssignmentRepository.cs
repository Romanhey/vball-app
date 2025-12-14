using Schedule.Domain.Entities;

namespace Schedule.Domain.IRepositories
{
    public interface ITeamAssignmentRepository: ICrudRepository<TeamAssignment>, IGetAllRepository<TeamAssignment>
    {
    }
}
