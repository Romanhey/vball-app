using System;
using System.Linq.Expressions;

namespace Schedule.Domain.Specification;

public class AndSpecification<T>(Specification<T> left, Specification<T> right) : Specification<T>
{
    private readonly Specification<T> left = left;
    private readonly Specification<T> right = right;

    public override Expression<Func<T, bool>> ToExpression()
    {
        Expression<Func<T, bool>> leftExpression = left.ToExpression();
        Expression<Func<T, bool>> rightExpression = right.ToExpression();

        ParameterExpression leftParam = leftExpression.Parameters.FirstOrDefault()
            ?? throw new Exception("Левый параметр пуст!");

        if (rightExpression.Parameters.FirstOrDefault() == null)
            throw new Exception("Правый параметр пуст!");

        if (ReferenceEquals(leftParam, rightExpression.Parameters.FirstOrDefault()))
        {
            return Expression.Lambda<Func<T, bool>>(
                Expression.AndAlso(leftExpression.Body, rightExpression.Body), leftParam);
        }

        return Expression.Lambda<Func<T, bool>>(
            Expression.AndAlso(
                leftExpression.Body,
                Expression.Invoke(rightExpression, leftParam)), leftParam);
    }
}