using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Schedule.Domain.IRepositories.BaseRepos;

namespace Schedule.Infrastructure.Persistence.Repositories;

public abstract class BaseRepository<T>(ApplicationDbContext context) : IBaseRepository<T> where T : class
{
    protected readonly ApplicationDbContext Context = context;

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await Context.Set<T>().AddAsync(entity, cancellationToken);
    }

    public Task DeleteAsync(T entity, CancellationToken cancellationToken = default)
    {
        Context.Set<T>().Remove(entity);
        return Task.CompletedTask;
    }

    public async Task<List<K>> GetAsync<K>
    (
        Expression<Func<T, bool>>? filter = null,
        Expression<Func<T, K>>? selector = null,
        int? skip = null,
        int? take = null,
        CancellationToken cancellationToken = default)
    {
        var query = Context.Set<T>()
        .Where(filter ?? (_ => true))
        .Select(selector ?? (e => (K)(object)e))
        .Skip(skip ?? 0)
        .Take(take ?? int.MaxValue);

        return await query.ToListAsync(cancellationToken);
    }

    public Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return Context.Set<T>().FindAsync(id, cancellationToken).AsTask();
    }

    public Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        Context.Set<T>().Update(entity);
        return Task.CompletedTask;
    }
}
