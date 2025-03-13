using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;

namespace NJS.Repositories.Repositories
{
    public class GoNoGoDecisionRepository : IGoNoGoDecisionRepository
    {
        private readonly ProjectManagementContext _context;


        public GoNoGoDecisionRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public IEnumerable<GoNoGoDecision> GetAll()
        {
            return _context.GoNoGoDecisions.ToList();
        }

        public GoNoGoDecision GetById(int id)
        {
            return _context.GoNoGoDecisions.Find(id);
        }

        public GoNoGoDecision GetByProjectId(int projectId)
        {
            return _context.GoNoGoDecisions.FirstOrDefault(d => d.ProjectId == projectId);
        }

        public void Add(GoNoGoDecision decision)
        {
            _context.GoNoGoDecisions.Add(decision);
            _context.SaveChanges();
        }

        public void Update(GoNoGoDecision decision)
        {
            _context.GoNoGoDecisions.Update(decision);
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var decision = _context.GoNoGoDecisions.Find(id);
            if (decision != null)
            {
                _context.GoNoGoDecisions.Remove(decision);
                _context.SaveChanges();
            }
        }

        // New methods for GoNoGoDecisionHeader and Transaction
        public async Task<GoNoGoDecisionHeader> GetHeaderById(int id)
        {
            return await _context.GoNoGoDecisionHeaders
                .Include(h => h.OpportunityTracking)
                .FirstOrDefaultAsync(h => h.Id == id);
        }

        public async Task<IEnumerable<GoNoGoDecisionTransaction>> GetTransactionsByHeaderId(int headerId)
        {
            return await _context.GoNoGoDecisionTransactions
                .Include(t => t.ScoringCriterias)
                .Where(t => t.GoNoGoDecisionHeaderId == headerId)
                .ToListAsync();
        }

        public async Task<GoNoGoDecisionHeader> AddHeader(GoNoGoDecisionHeader header)
        {
            _context.GoNoGoDecisionHeaders.Add(header);
            await _context.SaveChangesAsync();
            return header;
        }

        public async Task<bool> UpdateHeader(GoNoGoDecisionHeader header)
        {
            _context.GoNoGoDecisionHeaders.Update(header);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeleteHeader(int id)
        {
            var header = await _context.GoNoGoDecisionHeaders.FindAsync(id);
            if (header == null)
                return false;

            _context.GoNoGoDecisionHeaders.Remove(header);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<GoNoGoDecisionTransaction> AddTransaction(GoNoGoDecisionTransaction transaction)
        {
            _context.GoNoGoDecisionTransactions.Add(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task<bool> UpdateTransaction(GoNoGoDecisionTransaction transaction)
        {
            _context.GoNoGoDecisionTransactions.Update(transaction);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeleteTransaction(int id)
        {
            var transaction = await _context.GoNoGoDecisionTransactions.FindAsync(id);
            if (transaction == null)
                return false;

            _context.GoNoGoDecisionTransactions.Remove(transaction);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        // Version-related methods
        public async Task<GoNoGoVersion> CreateVersion(GoNoGoVersion version)
        {
            var header = await _context.GoNoGoDecisionHeaders
                .Include(h => h.Versions)
                .FirstOrDefaultAsync(h => h.Id == version.GoNoGoDecisionHeaderId);

            if (header == null)
                throw new Exception("GoNoGo decision header not found");

            version.VersionNumber = (header.Versions?.Count() ?? 0) + 1;
            version.CreatedAt = DateTime.UtcNow;
            version.Status = header.Versions?.Any() != true
                ? GoNoGoVersionStatus.BDM_PENDING
                : GetNextVersionStatus(header.VersionStatus.Value);

            _context.GoNoGoVersions.Add(version);

            header.CurrentVersion = version.VersionNumber;
            header.VersionStatus = version.Status;

            await _context.SaveChangesAsync();
            return version;
        }

        public async Task<GoNoGoVersion> UpdateVersion(GoNoGoVersion version)
        {

            _context.GoNoGoVersions.Add(version);

            await _context.SaveChangesAsync();
            return version;
        }

        public async Task<GoNoGoVersion> GetVersion(int headerId, int versionNumber)
        {
            return await _context.GoNoGoVersions
                .FirstOrDefaultAsync(v => v.GoNoGoDecisionHeaderId == headerId && v.VersionNumber == versionNumber);
        }

        public async Task<IEnumerable<GoNoGoVersion>> GetVersions(int headerId)
        {
            var result = await _context.GoNoGoVersions
                     .Where(v => v.GoNoGoDecisionHeaderId == headerId)
                     .OrderByDescending(v => v.CreatedAt)
                     .ToListAsync();

          var groupedResult = result
                     .GroupBy(x => new { x.GoNoGoDecisionHeaderId, x.VersionNumber }) 
                     .Select(g => g.FirstOrDefault())  
                     .ToList();
            return groupedResult;
        }

        public async Task<GoNoGoVersion> ApproveVersion(int headerId, int versionNumber, string approver, string comments)
        {
            var version = await _context.GoNoGoVersions.OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync(v => v.GoNoGoDecisionHeaderId == headerId && v.VersionNumber == versionNumber);

            if (version == null)
                throw new Exception("Version not found");

            var header = await _context.GoNoGoDecisionHeaders.FindAsync(headerId);
            if (header == null)
                throw new Exception("Header not found");

            version.ApprovedBy = approver;
            version.ApprovedAt = DateTime.UtcNow;
            version.Comments = comments;

            var nextStatus = GetNextVersionStatus(version.Status);
            version.Status = nextStatus;
            header.VersionStatus = nextStatus;

            await _context.SaveChangesAsync();
            return version;
        }

        public async Task<bool> UpdateVersionStatus(int headerId, GoNoGoVersionStatus newStatus)
        {
            var header = await _context.GoNoGoDecisionHeaders.FindAsync(headerId);
            if (header == null)
                return false;

            header.VersionStatus = newStatus;
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        private GoNoGoVersionStatus GetNextVersionStatus(GoNoGoVersionStatus currentStatus) => currentStatus switch
        {
            GoNoGoVersionStatus.BDM_PENDING => GoNoGoVersionStatus.BDM_APPROVED,
            GoNoGoVersionStatus.BDM_APPROVED => GoNoGoVersionStatus.RM_PENDING,
            GoNoGoVersionStatus.RM_PENDING => GoNoGoVersionStatus.RM_APPROVED,
            GoNoGoVersionStatus.RM_APPROVED => GoNoGoVersionStatus.RD_PENDING,
            GoNoGoVersionStatus.RD_PENDING => GoNoGoVersionStatus.RD_APPROVED,
            GoNoGoVersionStatus.RD_APPROVED => GoNoGoVersionStatus.COMPLETED,
            _ => throw new Exception("Invalid version status")
        };

        public async Task<GoNoGoDecisionHeader> GetByOpportunityId(int opportuntiy)
        {
            var header = await _context.GoNoGoDecisionHeaders.Where(x => x.OpportunityId == opportuntiy).OrderByDescending(x => x.CreatedAt).FirstOrDefaultAsync();
            return header;
        }

        public async Task<GoNoGoDecisionHeader?> GetHeaderIncludeVersionsByHeaderIdAsync(int id)
        {
            var header = await _context.GoNoGoDecisionHeaders
                .Include(h => h.Versions)
                .FirstOrDefaultAsync(h => h.Id == id);
            return header;
        }

        public GoNoGoVersion GetVersionsByUser(string currentUser)
        {
            return _context.GoNoGoVersions.Where(x => x.ActonBy == currentUser).OrderByDescending(x => x.CreatedAt).FirstOrDefault();
        }
    }


}
