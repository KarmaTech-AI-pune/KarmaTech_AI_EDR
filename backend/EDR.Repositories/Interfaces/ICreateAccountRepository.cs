namespace EDR.Repositories.Interfaces
{
    public interface ICreateAccountRepository
    {
        Task<bool> CreateAccountAsync(EDR.Domain.Entities.CreateAccount account);
    }
}

