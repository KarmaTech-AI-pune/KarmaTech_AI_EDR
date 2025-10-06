using MediatR;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using NJS.Application.CQRS.Cashflow.Commands;

namespace NJS.Application.CQRS.Cashflow.Handlers
{
    public class CreateCashflowCommandHandler : IRequestHandler<CreateCashflowCommand, CashflowDto>
    {
        private readonly ICashflowRepository _cashflowRepository;

        public CreateCashflowCommandHandler(ICashflowRepository cashflowRepository)
        {
            _cashflowRepository = cashflowRepository;
        }

        public async Task<CashflowDto> Handle(CreateCashflowCommand request, CancellationToken cancellationToken)
        {
            var cashflow = new Domain.Entities.Cashflow
            {
                Month = request.Cashflow.Month,
                TotalHours = request.Cashflow.TotalHours,
                PersonnelCost = request.Cashflow.PersonnelCost,
                OdcCost = request.Cashflow.OdcCost,
                TotalProjectCost = request.Cashflow.TotalProjectCost,
                CumulativeCost = request.Cashflow.CumulativeCost,
                Revenue = request.Cashflow.Revenue,
                CumulativeRevenue = request.Cashflow.CumulativeRevenue,
                CashFlow = request.Cashflow.CashFlow,
                ProjectId = request.Cashflow.ProjectId
            };

            await _cashflowRepository.AddAsync(cashflow);
            await _cashflowRepository.SaveChangesAsync();

            return new CashflowDto
            {
                Id = cashflow.Id,
                Month = cashflow.Month,
                TotalHours = cashflow.TotalHours,
                PersonnelCost = cashflow.PersonnelCost,
                OdcCost = cashflow.OdcCost,
                TotalProjectCost = cashflow.TotalProjectCost,
                CumulativeCost = cashflow.CumulativeCost,
                Revenue = request.Cashflow.Revenue,
                CumulativeRevenue = request.Cashflow.CumulativeRevenue,
                CashFlow = cashflow.CashFlow,
                ProjectId = cashflow.ProjectId
            };
        }
    }
}
