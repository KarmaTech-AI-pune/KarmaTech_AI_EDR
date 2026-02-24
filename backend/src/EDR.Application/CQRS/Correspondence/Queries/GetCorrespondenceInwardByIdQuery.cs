using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.Correspondence.Queries
{
    public class GetCorrespondenceInwardByIdQuery : IRequest<CorrespondenceInwardDto>
    {
        public int Id { get; set; }
    }
}

