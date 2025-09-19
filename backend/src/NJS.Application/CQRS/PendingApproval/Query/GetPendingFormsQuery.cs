using MediatR;
using System.Collections.Generic;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.PendingApproval.Query
{
    public class GetPendingFormsQuery : IRequest<List<PendingFormDto>>
    {
    }
}
