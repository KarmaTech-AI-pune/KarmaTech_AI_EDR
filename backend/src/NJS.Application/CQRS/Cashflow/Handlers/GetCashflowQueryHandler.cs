using MediatR;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using NJS.Application.CQRS.Cashflow.Queries;

namespace NJS.Application.CQRS.Cashflow.Handlers
{
    public class GetCashflowQueryHandler : IRequestHandler<GetCashflowQuery, CashflowDto>
    {
        private readonly ICashflowRepository _cashflowRepository;

        public GetCashflowQueryHandler(ICashflowRepository cashflowRepository)
        {
            _cashflowRepository = cashflowRepository;
        }

        public async Task<CashflowDto> Handle(GetCashflowQuery request, CancellationToken cancellationToken)
        {
            var cashflow = await _cashflowRepository.GetByIdAsync(request.Id);

            if (cashflow == null)
            {
                return null;
            }

            return new CashflowDto
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
            };
        }
    }
}
