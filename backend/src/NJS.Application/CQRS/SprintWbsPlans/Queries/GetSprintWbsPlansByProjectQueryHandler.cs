using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintWbsPlans.Queries
{
    public class GetSprintWbsPlansByProjectQueryHandler : IRequestHandler<GetSprintWbsPlansByProjectQuery, List<SprintWbsPlan>>
    {
        private readonly ProjectManagementContext _context;

        public GetSprintWbsPlansByProjectQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<SprintWbsPlan>> Handle(GetSprintWbsPlansByProjectQuery request, CancellationToken cancellationToken)
        {
            return await _context.SprintWbsPlans
                .Where(x => x.ProjectId == request.ProjectId)
                .OrderBy(x => x.ProgramSequence)
                .ToListAsync(cancellationToken);
        }
    }
}
