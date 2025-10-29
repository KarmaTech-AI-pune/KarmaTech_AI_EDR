using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
    /// <summary>
    /// Query to get all WBS versions for a project
    /// </summary>
    public record GetWBSVersionsQuery(int ProjectId) : IRequest<List<WBSVersionDto>>;

    /// <summary>
    /// Query to get a specific WBS version
    /// </summary>
    public record GetWBSVersionQuery(int ProjectId, string Version) : IRequest<WBSVersionDetailsDto>;

    /// <summary>
    /// Query to get the active WBS version
    /// </summary>
    public record GetActiveWBSVersionQuery(int ProjectId) : IRequest<WBSVersionDetailsDto>;

    /// <summary>
    /// Query to compare two WBS versions
    /// </summary>
    public record CompareWBSVersionsQuery(int ProjectId, string Version1, string Version2) : IRequest<WBSVersionComparisonDto>;

    /// <summary>
    /// Query to get WBS version workflow history
    /// </summary>
    public record GetWBSVersionWorkflowHistoryQuery(int WBSVersionHistoryId) : IRequest<List<WBSVersionWorkflowHistoryDto>>;
}
