using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Permissions.Queries
{
    public class GetPermissionByIdQuery : IRequest<PermissionDto?>
    {
        public int Id { get; set; }
    }
}

