using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.PendingApproval.Query
{
    public class GetPendingFormsQuery : IRequest<PendingFormsResponseDto>
    {
    }
}
