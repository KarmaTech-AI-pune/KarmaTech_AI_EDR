using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Permissions.Queries
{
    public class GetPermissionByIdQuery : IRequest<PermissionDto?>
    {
        public int Id { get; set; }
    }
}
