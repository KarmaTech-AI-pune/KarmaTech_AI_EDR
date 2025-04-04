using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.JobStartForm.Queries
{
    public class GetAllJobStartFormByProjectIdQuery : IRequest<IEnumerable<JobStartFormDto>>
    {
        public int ProjectId { get; set; }

        public GetAllJobStartFormByProjectIdQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }
}
