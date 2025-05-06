using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
    // Renaming to GetWBSByProjectIdQuery for clarity as it returns the whole structure
    public record GetWBSByProjectIdQuery(int ProjectId) : IRequest<WBSStructureDto>;
}
