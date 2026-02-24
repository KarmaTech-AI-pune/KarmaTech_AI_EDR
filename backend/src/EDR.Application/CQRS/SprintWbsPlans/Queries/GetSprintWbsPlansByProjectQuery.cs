using MediatR;
using EDR.Domain.Entities;
using System.Collections.Generic;

namespace EDR.Application.CQRS.SprintWbsPlans.Queries
{
    public class GetSprintWbsPlansByProjectQuery : IRequest<List<SprintWbsPlan>>
    {
        public int ProjectId { get; set; }

        public GetSprintWbsPlansByProjectQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }
}

