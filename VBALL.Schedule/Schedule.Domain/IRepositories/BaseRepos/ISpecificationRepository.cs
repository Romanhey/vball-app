using System;
using System.Linq.Expressions;

namespace Schedule.Domain.IRepositories.BaseRepos;

public interface ISpecificationRepository<T>
{
    Task<List<K>> GetAsync<K>(
        Expression<Func<T, bool>>? filter = null,
        Expression<Func<T, K>>? selector = null,
        int? skip = null,
        int? take = null,
        CancellationToken cancellationToken = default
        );
}

