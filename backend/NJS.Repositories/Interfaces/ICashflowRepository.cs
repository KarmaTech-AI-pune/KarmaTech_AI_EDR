using NJS.Domain.Entities;
using NJS.Domain.GenericRepository;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace NJS.Repositories.Interfaces
{
    public interface ICashflowRepository : IRepository<Cashflow>
    {
        Task<Cashflow> GetByIdAsync(int id);
        Task<IEnumerable<Cashflow>> GetAllAsync(int projectId);
    }
}
