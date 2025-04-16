using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface IInputRegisterRepository
    {
        Task<IEnumerable<Domain.Entities.InputRegister>> GetAllAsync();
        Task<Domain.Entities.InputRegister> GetByIdAsync(int id);
        Task<IEnumerable<Domain.Entities.InputRegister>> GetByProjectIdAsync(int projectId);
        Task<int> AddAsync(Domain.Entities.InputRegister inputRegister);
        Task UpdateAsync(Domain.Entities.InputRegister inputRegister);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task ResetIdentitySeedAsync();
    }
}
