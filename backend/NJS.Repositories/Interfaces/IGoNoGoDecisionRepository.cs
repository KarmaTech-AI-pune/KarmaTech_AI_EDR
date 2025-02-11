using NJS.Domain.Entities;
using NJS.Domain.Enums;
using System.Collections.Generic;

namespace NJS.Repositories.Interfaces
{
    public interface IGoNoGoDecisionRepository
    {
        // Decision methods
        IEnumerable<GoNoGoDecision> GetAll();
        GoNoGoDecision GetById(int id);
        GoNoGoDecision GetByProjectId(int projectId);
        void Add(GoNoGoDecision decision);
        void Update(GoNoGoDecision decision);
        void Delete(int id);

        // Version management methods
        Task<GoNoGoVersion> CreateVersion(GoNoGoVersion version);
        Task<GoNoGoVersion> GetVersion(int headerId, int versionNumber);
        Task<IEnumerable<GoNoGoVersion>> GetVersions(int headerId);
        Task<GoNoGoVersion> ApproveVersion(int headerId, int versionNumber, string approver, string comments);
        Task<bool> UpdateVersionStatus(int headerId, GoNoGoVersionStatus newStatus);

        // Header and Transaction methods
        Task<GoNoGoDecisionHeader> GetHeaderById(int id);
        Task<IEnumerable<GoNoGoDecisionTransaction>> GetTransactionsByHeaderId(int headerId);
        Task<GoNoGoDecisionHeader> GetByOpportunityId(int opportuntiy);
        Task<GoNoGoDecisionHeader> AddHeader(GoNoGoDecisionHeader header);
        Task<GoNoGoDecisionTransaction> AddTransaction(GoNoGoDecisionTransaction transaction);
        Task<bool> UpdateHeader(GoNoGoDecisionHeader header);
        Task<bool> UpdateTransaction(GoNoGoDecisionTransaction transaction);
        Task<bool> DeleteHeader(int id);
        Task<bool> DeleteTransaction(int id);
    }

}
