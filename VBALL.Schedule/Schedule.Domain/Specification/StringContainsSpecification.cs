namespace Schedule.Domain.Specification;

using System;
using System.Linq.Expressions;
using System.Reflection;

public class StringContainsSpecification<T>(
    Expression<Func<T, string?>> keySelector, 
    string searchString) : Specification<T>
    where T : class
{
    private static readonly MethodInfo ContainsMethod = typeof(string).GetMethod(nameof(string.Contains), [typeof(string)])!;

    public override Expression<Func<T, bool>> ToExpression()
    {
        if (string.IsNullOrEmpty(searchString))
        {
            return x => true;
        }

        var memberAccess = keySelector.Body;
        var param = keySelector.Parameters[0];
        
        var value = Expression.Constant(searchString, typeof(string));
        
        var callContains = Expression.Call(memberAccess, ContainsMethod, value);

        return Expression.Lambda<Func<T, bool>>(callContains, param);
    }
}