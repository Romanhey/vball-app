namespace Identity.Domain.IRepository
{
    public interface IUnitOfWork
    {
        public IUserRepository UserRepository { get; }
        Task CompleteAsync();
    }
}
