using MediatR;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NJS.Application.CQRS.Cashflow.Queries;

namespace NJS.Application.CQRS.Cashflow.Handlers
{
    public class GetAllCashflowsQueryHandler : IRequestHandler<Queries.GetAllCashflowsQuery, List<CashflowDto>>
    {
        private readonly ICashflowRepository _cashflowRepository;

        public GetAllCashflowsQueryHandler(ICashflowRepository cashflowRepository)
        {
            _cashflowRepository = cashflowRepository;
        }

        public async Task<List<CashflowDto>> Handle(Queries.GetAllCashflowsQuery request, CancellationToken cancellationToken)
        {
            var cashflows = await _cashflowRepository.GetAllAsync(request.ProjectId);

            return cashflows.Select(cashflow => new CashflowDto
            {
                Id = cashflow.Id,
                Month = cashflow.Month,
                TotalHours = cashflow.TotalHours,
                PersonnelCost = cashflow.PersonnelCost,
                OdcCost = cashflow.OdcCost,
                TotalProjectCost = cashflow.TotalProjectCost,
                CumulativeCost = cashflow.CumulativeCost,
                Revenue = cashflow.Revenue,
                CumulativeRevenue = cashflow.CumulativeRevenue,
                CashFlow = cashflow.CashFlow,
                ProjectId = cashflow.ProjectId
            }).ToList();
        }
    }
}
