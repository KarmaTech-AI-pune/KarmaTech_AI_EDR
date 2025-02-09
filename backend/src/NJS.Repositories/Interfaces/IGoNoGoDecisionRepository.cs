using System.Collections.Generic;
using System.Threading.Tasks;
using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IGoNoGoDecisionRepository
    {
        IEnumerable<GoNoGoDecision> GetAll();
        GoNoGoDecision GetById(int id);
        GoNoGoDecision GetByProjectId(int projectId);
        void Add(GoNoGoDecision decision);
        void Update(GoNoGoDecision decision);
        void Delete(int id);

        // New methods for GoNoGoDecisionHeader and Transaction
        Task<GoNoGoDecisionHeader> GetHeaderById(int id);
        Task<IEnumerable<GoNoGoDecisionTransaction>> GetTransactionsByHeaderId(int headerId);
        Task<GoNoGoDecisionHeader> AddHeader(GoNoGoDecisionHeader header);
        Task<GoNoGoDecisionTransaction> AddTransaction(GoNoGoDecisionTransaction transaction);
        Task<bool> UpdateHeader(GoNoGoDecisionHeader header);
        Task<bool> UpdateTransaction(GoNoGoDecisionTransaction transaction);
        Task<bool> DeleteHeader(int id);
        Task<bool> DeleteTransaction(int id);
    }
}
