using System;

namespace Schedule.Domain.IRepositories.BaseRepos;

public interface IBaseRepository<T> : ICrudRepository<T>, ISpecificationRepository<T> where T : class;
