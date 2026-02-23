using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface IPaymentMilestoneRepository
    {
        Task<PaymentMilestone> AddAsync(PaymentMilestone entity);
        Task<List<PaymentMilestone>> GetByProjectIdAsync(int projectId);
        Task<PaymentMilestone> GetByIdAsync(int id);
        Task UpdateAsync(PaymentMilestone entity);
        Task DeleteAsync(int id);
    }
}
