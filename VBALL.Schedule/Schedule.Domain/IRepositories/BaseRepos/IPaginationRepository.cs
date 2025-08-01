namespace Schedule.Domain.IRepositories
{
    public interface IPaginationRepository<T> where T : class
    {
        Task<List<T>> GetRangeAsync(int skip, int take, CancellationToken cancellationToken);
    }
}
