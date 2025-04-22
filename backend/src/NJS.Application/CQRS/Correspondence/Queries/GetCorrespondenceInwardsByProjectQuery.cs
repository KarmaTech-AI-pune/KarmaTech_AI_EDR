using MediatR;
using NJS.Application.DTOs;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Correspondence.Queries
{
    public class GetCorrespondenceInwardsByProjectQuery : IRequest<IEnumerable<CorrespondenceInwardDto>>
    {
        public int ProjectId { get; set; }
    }
}
