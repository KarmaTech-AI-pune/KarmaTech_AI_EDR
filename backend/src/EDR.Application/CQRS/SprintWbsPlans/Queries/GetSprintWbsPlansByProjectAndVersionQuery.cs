using MediatR;
using EDR.Domain.Entities;
using System.Collections.Generic;

namespace EDR.Application.CQRS.SprintWbsPlans.Queries
{
    public class GetSprintWbsPlansByProjectAndVersionQuery : IRequest<List<SprintWbsPlan>>
    {
        public int ProjectId { get; set; }
        public int BacklogVersion { get; set; }

        public GetSprintWbsPlansByProjectAndVersionQuery(int projectId, int backlogVersion)
        {
            ProjectId = projectId;
            BacklogVersion = backlogVersion;
        }
    }
}
