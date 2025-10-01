using MediatR;
using NJS.Application.DTOs;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Cashflow.Queries
{
    public class GetAllCashflowsQuery : IRequest<List<CashflowDto>>
    {
        public int ProjectId { get; set; }
    }
}
