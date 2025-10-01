using MediatR;
using MediatR;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using NJS.Application.CQRS.Cashflow.Commands;

namespace NJS.Application.CQRS.Cashflow.Handlers
{
    public class UpdateCashflowCommandHandler : IRequestHandler<UpdateCashflowCommand, CashflowDto>
    {
        private readonly ICashflowRepository _cashflowRepository;

        public UpdateCashflowCommandHandler(ICashflowRepository cashflowRepository)
        {
            _cashflowRepository = cashflowRepository;
        }

        public async Task<CashflowDto> Handle(UpdateCashflowCommand request, CancellationToken cancellationToken)
        {
            var cashflow = await _cashflowRepository.GetByIdAsync(request.Id);

            if (cashflow == null)
            {
                return null;
            }

            cashflow.Month = request.Cashflow.Month;
            cashflow.TotalHours = request.Cashflow.TotalHours;
            cashflow.PersonnelCost = request.Cashflow.PersonnelCost;
            cashflow.OdcCost = request.Cashflow.OdcCost;
            cashflow.TotalProjectCost = request.Cashflow.TotalProjectCost;
            cashflow.CumulativeCost = request.Cashflow.CumulativeCost;
            cashflow.Revenue = request.Cashflow.Revenue;
            cashflow.CumulativeRevenue = request.Cashflow.CumulativeRevenue;
            cashflow.CashFlow = request.Cashflow.CashFlow;
            cashflow.ProjectId = request.Cashflow.ProjectId;

            await _cashflowRepository.UpdateAsync(cashflow);
            await _cashflowRepository.SaveChangesAsync();

            return new CashflowDto
            {
                Id = cashflow.Id,
                Month = cashflow.Month,
                TotalHours = cashflow.TotalHours,
                PersonnelCost = cashflow.PersonnelCost,
                OdcCost = cashflow.OdcCost,
                TotalProjectCost = request.Cashflow.TotalProjectCost,
                CumulativeCost = request.Cashflow.CumulativeCost,
                Revenue = request.Cashflow.Revenue,
                CumulativeRevenue = request.Cashflow.CumulativeRevenue,
                CashFlow = cashflow.CashFlow,
                ProjectId = cashflow.ProjectId
            };
        }
    }
}
