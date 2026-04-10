using System.Collections.Generic;
using MediatR;
using EDR.Application.Dtos.ProjectDashboard;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries
{
    public class GetProjectMilestonesQuery : IRequest<List<MilestoneBillingDto>>
    {
        public int ProjectId { get; set; }
    }
}
