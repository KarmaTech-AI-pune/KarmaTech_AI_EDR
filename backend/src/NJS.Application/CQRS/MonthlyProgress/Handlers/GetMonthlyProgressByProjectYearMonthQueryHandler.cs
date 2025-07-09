using MediatR;
using NJS.Application.CQRS.MonthlyProgress.Queries;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.MonthlyProgress.Handlers
{
    public class GetMonthlyProgressByProjectYearMonthQueryHandler : IRequestHandler<GetMonthlyProgressByProjectYearMonthQuery, MonthlyProgressDto>
    {
        private readonly IMonthlyProgressRepository _monthlyProgressRepository;

        public GetMonthlyProgressByProjectYearMonthQueryHandler(IMonthlyProgressRepository monthlyProgressRepository)
        {
            _monthlyProgressRepository = monthlyProgressRepository ?? throw new ArgumentNullException(nameof(monthlyProgressRepository));
        }

        public async Task<MonthlyProgressDto> Handle(GetMonthlyProgressByProjectYearMonthQuery request, CancellationToken cancellationToken)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            var monthlyProgressEntity = await _monthlyProgressRepository.GetByProjectYearMonthAsync(request.ProjectId, request.Year, request.Month);

            if (monthlyProgressEntity == null)
            {
                return null; // Or throw a NotFoundException
            }

            // Manual mapping from entity to DTO
            return new MonthlyProgressDto
            {
                Id = monthlyProgressEntity.Id,
                ProjectId = monthlyProgressEntity.ProjectId,
                Month = monthlyProgressEntity.Month,
                Year = monthlyProgressEntity.Year,
                FinancialAndContractDetails = monthlyProgressEntity.FinancialDetails != null ? new FinancialDetailsDto
                {
                    Net = monthlyProgressEntity.FinancialDetails.Net,
                    ServiceTax = monthlyProgressEntity.FinancialDetails.ServiceTax,
                    FeeTotal = monthlyProgressEntity.FinancialDetails.FeeTotal,
                    BudgetOdcs = monthlyProgressEntity.FinancialDetails.BudgetOdcs,
                    BudgetStaff = monthlyProgressEntity.FinancialDetails.BudgetStaff,
                    BudgetSubTotal = monthlyProgressEntity.FinancialDetails.BudgetSubTotal,
                    ContractType = monthlyProgressEntity.FinancialDetails.ContractType
                } : null,
                ActualCost = monthlyProgressEntity.ContractAndCost != null ? new ContractAndCostDto
                {
                    PriorCumulativeOdc = monthlyProgressEntity.ContractAndCost.PriorCumulativeOdc,
                    PriorCumulativeStaff = monthlyProgressEntity.ContractAndCost.PriorCumulativeStaff,
                    PriorCumulativeTotal = monthlyProgressEntity.ContractAndCost.PriorCumulativeTotal,
                    ActualOdc = monthlyProgressEntity.ContractAndCost.ActualOdc,
                    ActualStaff = monthlyProgressEntity.ContractAndCost.ActualStaff,
                    ActualSubtotal = monthlyProgressEntity.ContractAndCost.ActualSubtotal,
                    TotalCumulativeOdc = monthlyProgressEntity.ContractAndCost.TotalCumulativeOdc,
                    TotalCumulativeStaff = monthlyProgressEntity.ContractAndCost.TotalCumulativeStaff,
                    TotalCumulativeCost = monthlyProgressEntity.ContractAndCost.TotalCumulativeCost
                } : null,
                CtcAndEac = monthlyProgressEntity.CTCEAC != null ? new CTCEACDto
                {
                    CtcODC = monthlyProgressEntity.CTCEAC.CtcODC,
                    CtcStaff = monthlyProgressEntity.CTCEAC.CtcStaff,
                    CtcSubtotal = monthlyProgressEntity.CTCEAC.CtcSubtotal,
                    ActualctcODC = monthlyProgressEntity.CTCEAC.ActualctcODC,
                    ActualCtcStaff = monthlyProgressEntity.CTCEAC.ActualCtcStaff,
                    ActualCtcSubtotal = monthlyProgressEntity.CTCEAC.ActualCtcSubtotal,
                    EacOdc = monthlyProgressEntity.CTCEAC.EacOdc,
                    EacStaff = monthlyProgressEntity.CTCEAC.EacStaff,
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
                ManpowerPlanning = new ManpowerPlanningDto
                {
                    Manpower = monthlyProgressEntity.ManpowerEntries?.Select(mp => new ManpowerDto
                    {
                        WorkAssignment = mp.WorkAssignment,
                        Assignee = mp.Assignee,
                        Planned = mp.Planned,
                        Consumed = mp.Consumed,
                        Balance = mp.Balance,
                        NextMonthPlanning = mp.NextMonthPlanning,
                        ManpowerComments = mp.ManpowerComments
                    }).ToList(),
                    ManpowerTotal = new ManpowerTotalDto
                    {
                        PlannedTotal = monthlyProgressEntity.ManpowerEntries?.Sum(x => x.Planned),
                        ConsumedTotal = monthlyProgressEntity.ManpowerEntries?.Sum(x => x.Consumed),
                        BalanceTotal = monthlyProgressEntity.ManpowerEntries?.Sum(x => x.Balance),
                        NextMonthPlanningTotal = monthlyProgressEntity.ManpowerEntries?.Sum(x => x.NextMonthPlanning)
                    }
                },
                ProgressDeliverable = new ProgressDeliverableWrapperDto
                {
                    Deliverables = monthlyProgressEntity.ProgressDeliverables?.Select(pd => new ProgressDeliverableDto
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
                    TotalPaymentDue = monthlyProgressEntity.ProgressDeliverables?.Sum(pd => pd.PaymentDue) ?? 0
                },
                ChangeOrder = monthlyProgressEntity.ChangeOrders?.Select(co => new ChangeOrderDto
                {
                    ContractTotal = co.ContractTotal,
                    Cost = co.Cost,
                    Fee = co.Fee,
                    SummaryDetails = co.SummaryDetails,
                    Status = co.Status
                }).ToList(),
                ProgrammeSchedule = monthlyProgressEntity.ProgrammeSchedules?.Select(ps => new ProgrammeScheduleDto
                {
                    ProgrammeDescription = ps.ProgrammeDescription
                }).ToList(),
                EarlyWarnings = monthlyProgressEntity.EarlyWarnings?.Select(ew => new EarlyWarningDto
                {
                    WarningsDescription = ew.WarningsDescription
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
                }).ToList(),
                BudgetTable = monthlyProgressEntity.BudgetTable != null ? new BudgetTableDto
                {
                    OriginalBudget = monthlyProgressEntity.BudgetTable.OriginalBudget != null ? new OriginalBudgetDto
                    {
                        RevenueFee = monthlyProgressEntity.BudgetTable.OriginalBudget.RevenueFee,
                        Cost = monthlyProgressEntity.BudgetTable.OriginalBudget.Cost,
                        ProfitPercentage = monthlyProgressEntity.BudgetTable.OriginalBudget.ProfitPercentage
                    } : null,
                    CurrentBudgetInMIS = monthlyProgressEntity.BudgetTable.CurrentBudgetInMIS != null ? new CurrentBudgetInMISDto
                    {
                        RevenueFee = monthlyProgressEntity.BudgetTable.CurrentBudgetInMIS.RevenueFee,
                        Cost = monthlyProgressEntity.BudgetTable.CurrentBudgetInMIS.Cost,
                        ProfitPercentage = monthlyProgressEntity.BudgetTable.CurrentBudgetInMIS.ProfitPercentage
                    } : null,
                    PercentCompleteOnCosts = monthlyProgressEntity.BudgetTable.PercentCompleteOnCosts != null ? new PercentCompleteOnCostsDto
                    {
                        RevenueFee = monthlyProgressEntity.BudgetTable.PercentCompleteOnCosts.RevenueFee,
                        Cost = monthlyProgressEntity.BudgetTable.PercentCompleteOnCosts.Cost
                    } : null
                } : null
            };
        }
    }
}
