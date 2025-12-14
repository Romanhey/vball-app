namespace Schedule.Domain.Specification.MatchSpecifications;

using System;
using System.Linq.Expressions;
using System.Reflection;


public class ValueSpecification<T, K>(Expression<Func<T, K>> keySelector, K[] values) : Specification<T>
    where T : class
{
    private readonly List<K> Values = [.. values];
    private readonly Expression<Func<T, K>> keySelector = keySelector;

     private static MethodInfo ContainsMethodInfo { get => typeof(List<K>).GetMethod(nameof(List<K>.Contains))!; }

    public override Expression<Func<T, bool>> ToExpression()
    {
        var call = Expression.Call(
                    Expression.Constant(Values),
                    ContainsMethodInfo,
                    (MemberExpression)keySelector.Body);

        return Expression.Lambda<Func<T, bool>>(call, keySelector.Parameters);
    }
}

