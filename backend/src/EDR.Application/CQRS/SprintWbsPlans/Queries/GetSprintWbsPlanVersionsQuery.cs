using MediatR;
using System.Collections.Generic;

namespace EDR.Application.CQRS.SprintWbsPlans.Queries
{
    public class GetSprintWbsPlanVersionsQuery : IRequest<List<int>>
    {
        public int ProjectId { get; set; }

        public GetSprintWbsPlanVersionsQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }
}
