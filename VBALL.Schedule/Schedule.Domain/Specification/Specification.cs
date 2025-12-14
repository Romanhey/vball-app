using System;
using System.Linq.Expressions;

namespace Schedule.Domain.Specification;

public abstract class Specification<T>
{
    public abstract Expression<Func<T, bool>> ToExpression();

    public virtual bool isSatisfiedBy(T entity)
    {
        Func<T, bool> predicate = ToExpression().Compile();
        return predicate(entity);
    }

    public Specification<T> And(Specification<T> specification) => new AndSpecification<T>(this, specification);

    public Specification<T> Or(Specification<T> specification) => new OrSpecification<T>(this, specification);

    public Specification<T> Not() => new NotSpecification<T>(this);

    public static bool operator true(Specification<T> specification) => true;

    public static bool operator false(Specification<T> specification) => false;

    public static Specification<T> operator &(Specification<T> left, Specification<T> right) => left.And(right);

    public static Specification<T> operator |(Specification<T> left, Specification<T> right) => left.Or(right);

    public static Specification<T> operator !(Specification<T> specification) => specification.Not();

}
