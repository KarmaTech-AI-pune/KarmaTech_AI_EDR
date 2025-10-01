namespace NJS.Repositories.Interfaces
{
    public interface ICreateAccountRepository
    {
        Task<bool> CreateAccountAsync(NJS.Domain.Entities.CreateAccount account);
    }
}
