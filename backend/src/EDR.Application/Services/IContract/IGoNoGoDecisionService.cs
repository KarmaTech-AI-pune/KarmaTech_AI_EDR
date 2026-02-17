using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Application.Services.IContract
{
    public interface IGoNoGoDecisionService
    {
        IEnumerable<GoNoGoDecision> GetAll();
        GoNoGoDecision GetById(int id);
        GoNoGoDecision GetByProjectId(int projectId);
        void Add(GoNoGoDecision decision);
        void Update(GoNoGoDecision decision);
        void Delete(int id);

        // Version management methods
        Task<GoNoGoVersion> CreateVersion(GoNoGoVersion version);
        Task<GoNoGoVersion> UpdateVersion(GoNoGoVersion version);
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
        Task<GoNoGoDecisionHeader?> GetHeaderIncludeVersionsByHeaderIdAsync(int id);

        // Methods with capping information
        GoNoGoDecisionDto GetByIdWithCappingInfo(int id);
        GoNoGoDecisionDto GetByProjectIdWithCappingInfo(int projectId);
        IEnumerable<GoNoGoSummaryDto> GetAllWithCappingInfo();
    }
}

