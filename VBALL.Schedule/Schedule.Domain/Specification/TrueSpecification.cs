using System.Linq.Expressions;

namespace Schedule.Domain.Specification;

public class TrueSpecification<T> : Specification<T> where T : class
{
    public override Expression<Func<T, bool>> ToExpression()
    {
        return x => true;
    }
}
