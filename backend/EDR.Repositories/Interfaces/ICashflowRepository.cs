using EDR.Domain.Entities;
using EDR.Domain.GenericRepository;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace EDR.Repositories.Interfaces
{
    public interface ICashflowRepository : IRepository<Cashflow>
    {
        Task<Cashflow> GetByIdAsync(int id);
        Task<IEnumerable<Cashflow>> GetAllAsync(int projectId);
        Task AddAsync(Cashflow cashflow);
        Task UpdateAsync(Cashflow cashflow);
        Task DeleteAsync(Cashflow cashflow);
    }
}

