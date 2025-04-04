using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.JobStartForm.Queries
{
    public class GetJobStartFormByProjectIdQuery : IRequest<IEnumerable<JobStartFormDto>>
    {
        public int ProjectId { get; set; }

        public GetJobStartFormByProjectIdQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }
}
