using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.Correspondence.Queries
{
    public class GetCorrespondenceOutwardByIdQuery : IRequest<CorrespondenceOutwardDto>
    {
        public int Id { get; set; }
    }
}

