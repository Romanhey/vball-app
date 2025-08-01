namespace Schedule.Domain.IRepositories
{
    public interface ICrudRepository<T> where T: class 
    {
        Task AddAsync(T entity, CancellationToken cancellationToken = default);
        Task<T?> GetByIdAsynd(int id);
        Task DeleteAsync(T entity,CancellationToken cancellationToken = default);
        Task UpdateAsync(T entity,CancellationToken cancellationToken = default);
    }
}
