using MediatR;
using EDR.Application.DTOs;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Cashflow.Queries
{
    public class GetAllCashflowsQuery : IRequest<List<CashflowDto>>
    {
        public int ProjectId { get; set; }
    }
}

