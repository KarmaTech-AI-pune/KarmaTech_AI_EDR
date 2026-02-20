using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace EDR.Application.CQRS.ChangeControl.Queries
{
    public class GetChangeControlsByProjectIdQuery : IRequest<IEnumerable<ChangeControlDto>>
    {
        [Required]
        public int ProjectId { get; set; }

        public GetChangeControlsByProjectIdQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }
}

