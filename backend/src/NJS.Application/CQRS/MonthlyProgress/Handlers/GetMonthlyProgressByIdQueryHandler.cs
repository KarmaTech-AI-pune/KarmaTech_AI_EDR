using MediatR;
using NJS.Application.CQRS.MonthlyProgress.Queries;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.MonthlyProgress.Handlers
{
    public class GetMonthlyProgressByIdQueryHandler : IRequestHandler<GetMonthlyProgressByIdQuery, MonthlyProgressDto>
    {
        private readonly IMonthlyProgressRepository _monthlyProgressRepository;

        public GetMonthlyProgressByIdQueryHandler(IMonthlyProgressRepository monthlyProgressRepository)
        {
            _monthlyProgressRepository = monthlyProgressRepository ?? throw new ArgumentNullException(nameof(monthlyProgressRepository));
        }

        public async Task<MonthlyProgressDto> Handle(GetMonthlyProgressByIdQuery request, CancellationToken cancellationToken)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            var monthlyProgressEntity = await _monthlyProgressRepository.GetByIdAsync(request.Id);

            if (monthlyProgressEntity == null)
            {
                return null; // Or throw a NotFoundException
            }

            // Manual mapping from entity to DTO
            return new MonthlyProgressDto
            {
                FinancialDetails = monthlyProgressEntity.FinancialDetails != null ? new FinancialDetailsDto
                {
                    Net = monthlyProgressEntity.FinancialDetails.Net,
                    ServiceTax = monthlyProgressEntity.FinancialDetails.ServiceTax,
                    FeeTotal = monthlyProgressEntity.FinancialDetails.FeeTotal,
                    BudgetOdcs = monthlyProgressEntity.FinancialDetails.BudgetOdcs,
                    BudgetStaff = monthlyProgressEntity.FinancialDetails.BudgetStaff,
                    BudgetSubTotal = monthlyProgressEntity.FinancialDetails.BudgetSubTotal
                } : null,
                ContractAndCost = monthlyProgressEntity.ContractAndCost != null ? new ContractAndCostDto
                {
                    Percentage = monthlyProgressEntity.ContractAndCost.Percentage,
                    ActualOdcs = monthlyProgressEntity.ContractAndCost.ActualOdcs,
                    ActualStaff = monthlyProgressEntity.ContractAndCost.ActualStaff,
                    ActualSubtotal = monthlyProgressEntity.ContractAndCost.ActualSubtotal
                } : null,
                CTCEAC = monthlyProgressEntity.CTCEAC != null ? new CTCEACDto
                {
                    CtcODC = monthlyProgressEntity.CTCEAC.CtcODC,
                    CtcStaff = monthlyProgressEntity.CTCEAC.CtcStaff,
                    CtcSubtotal = monthlyProgressEntity.CTCEAC.CtcSubtotal,
                    TotalEAC = monthlyProgressEntity.CTCEAC.TotalEAC,
                    GrossProfitPercentage = monthlyProgressEntity.CTCEAC.GrossProfitPercentage
                } : null,
                Schedule = monthlyProgressEntity.Schedule != null ? new ScheduleDto
                {
                    DateOfIssueWOLOI = monthlyProgressEntity.Schedule.DateOfIssueWOLOI,
                    CompletionDateAsPerContract = monthlyProgressEntity.Schedule.CompletionDateAsPerContract,
                    CompletionDateAsPerExtension = monthlyProgressEntity.Schedule.CompletionDateAsPerExtension,
                    ExpectedCompletionDate = monthlyProgressEntity.Schedule.ExpectedCompletionDate
                } : null,
                ManpowerEntries = monthlyProgressEntity.ManpowerEntries?.Select(mp => new ManpowerPlanningDto
                {
                    WorkAssignment = mp.WorkAssignment,
                    AssigneesJson = mp.Assignee, // Map Assignee to AssigneesJson
                    Planned = mp.Planned,
                    Consumed = mp.Consumed,
                    Balance = mp.Balance,
                    NextMonthPlanning = mp.NextMonthPlanning,
                    ManpowerComments = mp.ManpowerComments
                }).ToList(),
                ManpowerTotal = monthlyProgressEntity.ManpowerTotal,
                ProgressDeliverables = monthlyProgressEntity.ProgressDeliverables?.Select(pd => new ProgressDeliverableDto
                {
                    Milestone = pd.Milestone,
                    DueDateContract = pd.DueDateContract,
                    DueDatePlanned = pd.DueDatePlanned,
                    AchievedDate = pd.AchievedDate,
                    PaymentDue = pd.PaymentDue,
                    InvoiceDate = pd.InvoiceDate,
                    PaymentReceivedDate = pd.PaymentReceivedDate,
                    DeliverableComments = pd.DeliverableComments
                }).ToList(),
                ChangeOrders = monthlyProgressEntity.ChangeOrders?.Select(co => new ChangeOrderDto
                {
                    ContractTotal = co.ContractTotal,
                    Cost = co.Cost,
                    Fee = co.Fee,
                    SummaryDetails = co.SummaryDetails,
                    Status = co.Status
                }).ToList(),
                LastMonthActions = monthlyProgressEntity.LastMonthActions?.Select(lma => new LastMonthActionDto
                {
                    LMactions = lma.LMactions,
                    LMAdate = lma.LMAdate,
                    LMAcomments = lma.LMAcomments
                }).ToList(),
                CurrentMonthActions = monthlyProgressEntity.CurrentMonthActions?.Select(cma => new CurrentMonthActionDto
                {
                    CMactions = cma.CMactions,
                    CMAdate = cma.CMAdate,
                    CMAcomments = cma.CMAcomments,
                    CMApriority = cma.CMApriority
                }).ToList()
            };
        }
    }
}
