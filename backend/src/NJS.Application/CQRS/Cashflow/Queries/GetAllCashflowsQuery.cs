using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Cashflow.Queries
{
    public class GetAllCashflowsQuery : IRequest<MonthlyBudgetResponseDto>
    {
        public int ProjectId { get; set; }
    }
}
