using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.Correspondence.Queries
{
    public class GetCorrespondenceInwardByIdQuery : IRequest<CorrespondenceInwardDto>
    {
        public int Id { get; set; }
    }
}
