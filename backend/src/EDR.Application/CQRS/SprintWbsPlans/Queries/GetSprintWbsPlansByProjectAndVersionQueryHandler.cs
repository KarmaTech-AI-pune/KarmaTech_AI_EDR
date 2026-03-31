using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.SprintWbsPlans.Queries
{
    public class GetSprintWbsPlansByProjectAndVersionQueryHandler : IRequestHandler<GetSprintWbsPlansByProjectAndVersionQuery, List<SprintWbsPlan>>
    {
        private readonly ProjectManagementContext _context;

        public GetSprintWbsPlansByProjectAndVersionQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<SprintWbsPlan>> Handle(GetSprintWbsPlansByProjectAndVersionQuery request, CancellationToken cancellationToken)
        {
            var plans = await _context.SprintWbsPlans
                .Where(x => x.ProjectId == request.ProjectId && x.BacklogVersion == request.BacklogVersion)
                .ToListAsync(cancellationToken);

            return plans.OrderBy(x => x.ProgramSequence).ToList();
        }
    }
}
