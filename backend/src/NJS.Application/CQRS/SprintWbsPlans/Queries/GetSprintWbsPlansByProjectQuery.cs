using MediatR;
using NJS.Domain.Entities;
using System.Collections.Generic;

namespace NJS.Application.CQRS.SprintWbsPlans.Queries
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
