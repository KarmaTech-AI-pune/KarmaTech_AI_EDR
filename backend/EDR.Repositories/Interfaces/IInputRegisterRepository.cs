using EDR.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EDR.Repositories.Interfaces
{
    public interface IInputRegisterRepository
    {
        Task<IEnumerable<InputRegister>> GetAllAsync();
        Task<InputRegister> GetByIdAsync(int id);
        Task<IEnumerable<InputRegister>> GetByProjectIdAsync(int projectId);
        Task<int> AddAsync(InputRegister inputRegister);
        Task UpdateAsync(InputRegister inputRegister);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<int> GetNextIdAsync();
        Task ResetIdentitySeedAsync();
    }
}

