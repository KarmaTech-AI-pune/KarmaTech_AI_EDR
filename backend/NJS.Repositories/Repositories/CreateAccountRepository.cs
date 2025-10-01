using NJS.Repositories.Interfaces;
using NJS.Domain.Entities;
using NJS.Domain.Database;

namespace NJS.Repositories.Repositories
{
    public class CreateAccountRepository : ICreateAccountRepository
    {
        private readonly ProjectManagementContext _context;

        public CreateAccountRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateAccountAsync(CreateAccount account)
        {
            _context.CreateAccounts.Add(account);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }
    }
}
