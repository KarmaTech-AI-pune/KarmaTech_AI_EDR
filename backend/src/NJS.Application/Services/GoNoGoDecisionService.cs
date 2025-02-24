using Microsoft.AspNetCore.Identity;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Repositories.Interfaces;
using System.Text.Json;

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
        header.TotalScore = summary!.Summary.TotalScore;


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
}
