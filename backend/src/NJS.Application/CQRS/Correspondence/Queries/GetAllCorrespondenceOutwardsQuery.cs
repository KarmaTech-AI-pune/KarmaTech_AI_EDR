using MediatR;
using NJS.Application.DTOs;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Correspondence.Queries
{
    public class GetAllCorrespondenceOutwardsQuery : IRequest<IEnumerable<CorrespondenceOutwardDto>>
    {
    }
}
