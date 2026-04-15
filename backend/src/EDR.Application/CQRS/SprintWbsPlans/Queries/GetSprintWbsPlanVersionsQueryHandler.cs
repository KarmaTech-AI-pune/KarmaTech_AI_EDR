using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.SprintWbsPlans.Queries
{
    public class GetSprintWbsPlanVersionsQueryHandler : IRequestHandler<GetSprintWbsPlanVersionsQuery, List<int>>
    {
        private readonly ProjectManagementContext _context;

        public GetSprintWbsPlanVersionsQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<int>> Handle(GetSprintWbsPlanVersionsQuery request, CancellationToken cancellationToken)
        {
            var versions = await _context.SprintWbsPlans
                .Where(x => x.ProjectId == request.ProjectId)
                .Select(x => x.BacklogVersion)
                .Distinct()
                .OrderByDescending(x => x)
                .ToListAsync(cancellationToken);

            return versions;
        }
    }
}
