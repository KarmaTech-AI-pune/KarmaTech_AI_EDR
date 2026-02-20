using MediatR;
using EDR.Application.DTOs;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Correspondence.Queries
{
    public class GetCorrespondenceOutwardsByProjectQuery : IRequest<IEnumerable<CorrespondenceOutwardDto>>
    {
        public int ProjectId { get; set; }
    }
}

