using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Schedule.Domain.Entities;
using Schedule.Domain.IRepositories;

namespace Schedule.Infrastructure.Persistence.Repositories
{
    public class TeamRepository(ApplicationDbContext context) : BaseRepository<Team>(context), ITeamRepository
    {
    }
}
