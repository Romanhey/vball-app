using Identity.Domain.IRepository;

namespace Identity.Infastucture.Persistance
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        public IUserRepository UserRepository { get; }

        public UnitOfWork(
            ApplicationDbContext context,
            IUserRepository userRepository)
        {
            _context = context;
            UserRepository = userRepository;
        }

        public async Task CompleteAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
