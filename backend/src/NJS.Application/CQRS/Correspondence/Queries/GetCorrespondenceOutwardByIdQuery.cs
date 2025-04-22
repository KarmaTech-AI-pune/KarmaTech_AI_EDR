using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.Correspondence.Queries
{
    public class GetCorrespondenceOutwardByIdQuery : IRequest<CorrespondenceOutwardDto>
    {
        public int Id { get; set; }
    }
}
