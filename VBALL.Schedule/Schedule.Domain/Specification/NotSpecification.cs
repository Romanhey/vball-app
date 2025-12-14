using System;
using System.Linq.Expressions;

namespace Schedule.Domain.Specification;

public class NotSpecification<T>(Specification<T> spec) : Specification<T>
{
    private readonly Specification<T> spec = spec;

    public override Expression<Func<T, bool>> ToExpression()
    {
        Expression<Func<T, bool>> expr = spec.ToExpression();

        var notExpression = Expression.Not(expr.Body);

        return Expression.Lambda<Func<T, bool>>(
            notExpression, expr.Parameters.Single());
    }
}
