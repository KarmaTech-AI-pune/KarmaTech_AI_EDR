using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Cashflow.Queries
{
    public class GetAllCashflowsQuery : IRequest<MonthlyBudgetResponseDto>
    {
        public int ProjectId { get; set; }
    }
}
