using MediatR;
using EDR.Application.DTOs;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Correspondence.Queries
{
    public class GetCorrespondenceInwardsByProjectQuery : IRequest<IEnumerable<CorrespondenceInwardDto>>
    {
        public int ProjectId { get; set; }
    }
}

