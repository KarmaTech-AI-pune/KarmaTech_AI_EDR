using Microsoft.AspNetCore.Identity;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Repositories.Interfaces;
using System.Text.Json;
using NJS.Application.Helpers;

public class GoNoGoDecisionService : IGoNoGoDecisionService
{
    private readonly IGoNoGoDecisionRepository _goNoGoDecision;
    private readonly IUserContext _userContext;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;

    public GoNoGoDecisionService(IGoNoGoDecisionRepository goNoGoDecision, IUserContext userContext, RoleManager<Role> roleManager, UserManager<User> userManager)
    {
        _goNoGoDecision = goNoGoDecision;
        _userContext = userContext;
        _roleManager = roleManager;
        _userManager = userManager;
    }

    public void Add(GoNoGoDecision decision)
    {
        // Apply raw score (no capping) before adding to database
        ScoreCalculationHelper.ApplyRawScore(decision);
        _goNoGoDecision.Add(decision);
    }

    public Task<GoNoGoDecisionHeader> AddHeader(GoNoGoDecisionHeader header)
    {
        return _goNoGoDecision.AddHeader(header);
    }

    public Task<GoNoGoDecisionTransaction> AddTransaction(GoNoGoDecisionTransaction transaction)
    {
        return _goNoGoDecision.AddTransaction(transaction);
    }

    public async Task<GoNoGoVersion> ApproveVersion(int headerId, int versionNumber, string approver, string comments)
    {
        return await _goNoGoDecision.ApproveVersion(headerId, versionNumber, approver, comments);
    }

    public async Task<GoNoGoVersion> CreateVersion(GoNoGoVersion version)
    {
        version.ActonBy = _userContext.GetCurrentUserId();
        return await _goNoGoDecision.CreateVersion(version);
    }

    public void Delete(int id)
    {
        _goNoGoDecision.Delete(id);
    }

    public async Task<bool> DeleteHeader(int id)
    {
        return await _goNoGoDecision.DeleteHeader(id);
    }

    public async Task<bool> DeleteTransaction(int id)
    {
        return await _goNoGoDecision.DeleteTransaction(id);
    }

    public IEnumerable<GoNoGoDecision> GetAll()
    {
        return _goNoGoDecision.GetAll();
    }

    public GoNoGoDecision GetById(int id)
    {
        return _goNoGoDecision.GetById(id);
    }

    public async Task<GoNoGoDecisionHeader> GetByOpportunityId(int opportuntiy)
    {
        return await _goNoGoDecision.GetByOpportunityId(opportuntiy);
    }

    public GoNoGoDecision GetByProjectId(int projectId)
    {
        return _goNoGoDecision.GetByProjectId(projectId);
    }

    public async Task<GoNoGoDecisionHeader> GetHeaderById(int id)
    {
        return await _goNoGoDecision.GetHeaderById(id);
    }


    public async Task<IEnumerable<GoNoGoDecisionTransaction>> GetTransactionsByHeaderId(int headerId)
    {
        return await _goNoGoDecision.GetTransactionsByHeaderId(headerId);
    }

    public async Task<GoNoGoVersion> GetVersion(int headerId, int versionNumber)
    {
        return await _goNoGoDecision.GetVersion(headerId, versionNumber);
    }

    public async Task<IEnumerable<GoNoGoVersion>> GetVersions(int headerId)
    {
        return await _goNoGoDecision.GetVersions(headerId);
    }

    public void Update(GoNoGoDecision decision)
    {
        // Apply raw score (no capping) before updating in database
        ScoreCalculationHelper.ApplyRawScore(decision);
        _goNoGoDecision.Update(decision);
    }

    public async Task<bool> UpdateHeader(GoNoGoDecisionHeader header)
    {
        return await _goNoGoDecision.UpdateHeader(header);
    }

    public async Task<bool> UpdateTransaction(GoNoGoDecisionTransaction transaction)
    {
        return await _goNoGoDecision.UpdateTransaction(transaction);
    }

    public async Task<bool> UpdateVersionStatus(int headerId, GoNoGoVersionStatus newStatus)
    {
        return await _goNoGoDecision.UpdateVersionStatus(headerId, newStatus);
    }

    public async Task<GoNoGoDecisionHeader?> GetHeaderIncludeVersionsByHeaderIdAsync(int id)
    {
        return await _goNoGoDecision.GetHeaderIncludeVersionsByHeaderIdAsync(id);
    }

    public async Task<GoNoGoVersion> UpdateVersion(GoNoGoVersion version)
    {
        var currentUser = _userContext.GetCurrentUserId();
        var summary = JsonSerializer.Deserialize<GoNoGoForm>(version.FormData!);

        var header = await GetHeaderIncludeVersionsByHeaderIdAsync(version.GoNoGoDecisionHeaderId);

        var versionByUser = _goNoGoDecision.GetVersionsByUser(currentUser);

        var user = await _userManager.FindByIdAsync(currentUser);
        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Any(x => x.Equals("Regional Manager")))
        {
            version.VersionNumber = versionByUser?.VersionNumber ?? version.VersionNumber + 1;

            version.Status = GoNoGoVersionStatus.RM_PENDING;
        }
        if (roles.Any(x => x.Equals("Regional Director")))
        {

            version.VersionNumber = versionByUser?.VersionNumber ?? version.VersionNumber + 1;

            version.Status = GoNoGoVersionStatus.RD_PENDING;
        }

        if (header == null)
            throw new Exception("GoNoGo decision header not found");



        version.CreatedAt = DateTime.UtcNow;
        version.ActonBy = currentUser;


        header.CurrentVersion = version.VersionNumber;
        header.VersionStatus = version.Status;
        
        // Store raw total score (no capping)
        int rawTotalScore = summary!.Summary.TotalScore;
        header.TotalScore = rawTotalScore;


        return await _goNoGoDecision.UpdateVersion(version);
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

    /// <summary>
    /// Gets a GoNoGoDecision by ID and returns it as a DTO with percentage information
    /// </summary>
    /// <param name="id">The decision ID</param>
    /// <returns>GoNoGoDecisionDto with percentage information included</returns>
    public GoNoGoDecisionDto GetByIdWithCappingInfo(int id)
    {
        var decision = _goNoGoDecision.GetById(id);
        if (decision == null) return null;

        var scoreInfo = ScoreCalculationHelper.GetScoreInfo(decision);
        
        return new GoNoGoDecisionDto
        {
            ProjectId = decision.ProjectId,
            BidType = decision.BidType,
            Sector = decision.Sector,
            TenderFee = decision.TenderFee,
            EmdAmount = decision.EMDAmount,
            
            // Individual scores
            MarketingPlanScore = decision.MarketingPlanScore,
            MarketingPlanComments = decision.MarketingPlanComments,
            ClientRelationshipScore = decision.ClientRelationshipScore,
            ClientRelationshipComments = decision.ClientRelationshipComments,
            ProjectKnowledgeScore = decision.ProjectKnowledgeScore,
            ProjectKnowledgeComments = decision.ProjectKnowledgeComments,
            TechnicalEligibilityScore = decision.TechnicalEligibilityScore,
            TechnicalEligibilityComments = decision.TechnicalEligibilityComments,
            FinancialEligibilityScore = decision.FinancialEligibilityScore,
            FinancialEligibilityComments = decision.FinancialEligibilityComments,
            StaffAvailabilityScore = decision.StaffAvailabilityScore,
            StaffAvailabilityComments = decision.StaffAvailabilityComments,
            CompetitionAssessmentScore = decision.CompetitionAssessmentScore,
            CompetitionAssessmentComments = decision.CompetitionAssessmentComments,
            CompetitivePositionScore = decision.CompetitivePositionScore,
            CompetitivePositionComments = decision.CompetitivePositionComments,
            FutureWorkPotentialScore = decision.FutureWorkPotentialScore,
            FutureWorkPotentialComments = decision.FutureWorkPotentialComments,
            ProfitabilityScore = decision.ProfitabilityScore,
            ProfitabilityComments = decision.ProfitabilityComments,
            ResourceAvailabilityScore = decision.ResourceAvailabilityScore,
            ResourceAvailabilityComments = decision.ResourceAvailabilityComments,
            BidScheduleScore = decision.BidScheduleScore,
            BidScheduleComments = decision.BidScheduleComments,
            
            // Score information with percentage
            TotalScore = scoreInfo.RawTotalScore,
            RawTotalScore = scoreInfo.RawTotalScore,
            ScorePercentage = scoreInfo.ScorePercentage,
            MaxPossibleScore = scoreInfo.MaxPossibleScore,
            IsPerfectScore = scoreInfo.IsPerfectScore,
            IsScoreCapped = false, // Legacy property - always false now
            Status = decision.Status,
            DecisionComments = decision.DecisionComments,
            
            // Approval information
            CompletedDate = decision.CompletedDate,
            CompletedBy = decision.CompletedBy,
            ReviewedDate = decision.ReviewedDate,
            ReviewedBy = decision.ReviewedBy,
            ApprovedDate = decision.ApprovedDate,
            ApprovedBy = decision.ApprovedBy,
            ActionPlan = decision.ActionPlan,
            
            // Audit fields
            CreatedAt = decision.CreatedAt,
            CreatedBy = decision.CreatedBy,
            LastModifiedAt = decision.LastModifiedAt,
            LastModifiedBy = decision.LastModifiedBy
        };
    }

    /// <summary>
    /// Gets a GoNoGoDecision by Project ID and returns it as a DTO with percentage information
    /// </summary>
    /// <param name="projectId">The project ID</param>
    /// <returns>GoNoGoDecisionDto with percentage information included</returns>
    public GoNoGoDecisionDto GetByProjectIdWithCappingInfo(int projectId)
    {
        var decision = _goNoGoDecision.GetByProjectId(projectId);
        if (decision == null) return null;

        var scoreInfo = ScoreCalculationHelper.GetScoreInfo(decision);
        
        return new GoNoGoDecisionDto
        {
            ProjectId = decision.ProjectId,
            BidType = decision.BidType,
            Sector = decision.Sector,
            TenderFee = decision.TenderFee,
            EmdAmount = decision.EMDAmount,
            
            // Individual scores
            MarketingPlanScore = decision.MarketingPlanScore,
            MarketingPlanComments = decision.MarketingPlanComments,
            ClientRelationshipScore = decision.ClientRelationshipScore,
            ClientRelationshipComments = decision.ClientRelationshipComments,
            ProjectKnowledgeScore = decision.ProjectKnowledgeScore,
            ProjectKnowledgeComments = decision.ProjectKnowledgeComments,
            TechnicalEligibilityScore = decision.TechnicalEligibilityScore,
            TechnicalEligibilityComments = decision.TechnicalEligibilityComments,
            FinancialEligibilityScore = decision.FinancialEligibilityScore,
            FinancialEligibilityComments = decision.FinancialEligibilityComments,
            StaffAvailabilityScore = decision.StaffAvailabilityScore,
            StaffAvailabilityComments = decision.StaffAvailabilityComments,
            CompetitionAssessmentScore = decision.CompetitionAssessmentScore,
            CompetitionAssessmentComments = decision.CompetitionAssessmentComments,
            CompetitivePositionScore = decision.CompetitivePositionScore,
            CompetitivePositionComments = decision.CompetitivePositionComments,
            FutureWorkPotentialScore = decision.FutureWorkPotentialScore,
            FutureWorkPotentialComments = decision.FutureWorkPotentialComments,
            ProfitabilityScore = decision.ProfitabilityScore,
            ProfitabilityComments = decision.ProfitabilityComments,
            ResourceAvailabilityScore = decision.ResourceAvailabilityScore,
            ResourceAvailabilityComments = decision.ResourceAvailabilityComments,
            BidScheduleScore = decision.BidScheduleScore,
            BidScheduleComments = decision.BidScheduleComments,
            
            // Score information with percentage
            TotalScore = scoreInfo.RawTotalScore,
            RawTotalScore = scoreInfo.RawTotalScore,
            ScorePercentage = scoreInfo.ScorePercentage,
            MaxPossibleScore = scoreInfo.MaxPossibleScore,
            IsPerfectScore = scoreInfo.IsPerfectScore,
            IsScoreCapped = false, // Legacy property - always false now
            Status = decision.Status,
            DecisionComments = decision.DecisionComments,
            
            // Approval information
            CompletedDate = decision.CompletedDate,
            CompletedBy = decision.CompletedBy,
            ReviewedDate = decision.ReviewedDate,
            ReviewedBy = decision.ReviewedBy,
            ApprovedDate = decision.ApprovedDate,
            ApprovedBy = decision.ApprovedBy,
            ActionPlan = decision.ActionPlan,
            
            // Audit fields
            CreatedAt = decision.CreatedAt,
            CreatedBy = decision.CreatedBy,
            LastModifiedAt = decision.LastModifiedAt,
            LastModifiedBy = decision.LastModifiedBy
        };
    }

    /// <summary>
    /// Gets all GoNoGoDecisions and returns them as DTOs with percentage information
    /// </summary>
    /// <returns>Collection of GoNoGoSummaryDto with percentage information included</returns>
    public IEnumerable<GoNoGoSummaryDto> GetAllWithCappingInfo()
    {
        var decisions = _goNoGoDecision.GetAll();
        
        return decisions.Select(decision =>
        {
            var scoreInfo = ScoreCalculationHelper.GetScoreInfo(decision);
            
            return new GoNoGoSummaryDto
            {
                Id = decision.Id,
                ProjectId = decision.ProjectId,
                TotalScore = scoreInfo.RawTotalScore,
                RawTotalScore = scoreInfo.RawTotalScore,
                ScorePercentage = scoreInfo.ScorePercentage,
                MaxPossibleScore = scoreInfo.MaxPossibleScore,
                IsPerfectScore = scoreInfo.IsPerfectScore,
                IsScoreCapped = false, // Legacy property - always false now
                Status = decision.Status,
                DecisionComments = decision.DecisionComments,
                CompletedDate = decision.CompletedDate,
                CompletedBy = decision.CompletedBy,
                ApprovedDate = decision.ApprovedDate,
                ApprovedBy = decision.ApprovedBy
            };
        });
    }
}
