using System.Linq.Expressions;
using Schedule.Domain.Specification;

public class RangeSpecification<T, TValue>(
    Expression<Func<T, TValue?>> keySelector,
    TValue? min,
    TValue? max) : Specification<T>
    where T : class
    where TValue : struct, IComparable<TValue>
{
    public override Expression<Func<T, bool>> ToExpression()
    {
        var memberAccess = keySelector.Body;
        var param = keySelector.Parameters[0];

        Expression? body = null;

        if (min.HasValue)
        {
            var minConst = Expression.Constant(min.Value, typeof(TValue?));
            var greaterThan = Expression.GreaterThanOrEqual(memberAccess, Expression.Convert(Expression.Constant(min.Value), memberAccess.Type));
            body = greaterThan;
        }

        if (max.HasValue)
        {
            var maxConst = Expression.Constant(max.Value, typeof(TValue?));
            var lessThan = Expression.LessThanOrEqual(memberAccess, Expression.Convert(Expression.Constant(max.Value), memberAccess.Type));

            body = body == null 
                ? lessThan 
                : Expression.AndAlso(body, lessThan);
        }

        if (body == null)
        {
            return x => true;
        }

        return Expression.Lambda<Func<T, bool>>(body, param);
    }
}