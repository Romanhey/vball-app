namespace Schedule.Domain.IRepositories
{
    public interface IGetAllRepository<T> where T : class
    {
        IQueryable<T> GetAll();
    }
}
