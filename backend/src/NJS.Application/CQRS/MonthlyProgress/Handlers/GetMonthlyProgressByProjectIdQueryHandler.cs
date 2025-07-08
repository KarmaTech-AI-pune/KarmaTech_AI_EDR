using MediatR;
using NJS.Application.CQRS.MonthlyProgress.Queries;
using NJS.Application.DTOs;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.MonthlyProgress.Handlers
{
    public class GetMonthlyProgressByProjectIdQueryHandler : IRequestHandler<GetMonthlyProgressByProjectIdQuery, List<MonthlyProgressDto>>
    {
        private readonly IMonthlyProgressRepository _monthlyProgressRepository;

        public GetMonthlyProgressByProjectIdQueryHandler(IMonthlyProgressRepository monthlyProgressRepository)
        {
            _monthlyProgressRepository = monthlyProgressRepository;
        }

        public async Task<List<MonthlyProgressDto>> Handle(GetMonthlyProgressByProjectIdQuery request, CancellationToken cancellationToken)
        {
            var monthlyProgresses = await _monthlyProgressRepository.GetByProjectIdAsync(request.ProjectId);

            return monthlyProgresses.Select(mp => new MonthlyProgressDto
            {
                Id = mp.Id,
                ProjectId = mp.ProjectId,
                Month = mp.Month,
                Year = mp.Year,
                FinancialAndContractDetails = mp.FinancialDetails != null ? new FinancialDetailsDto
                {
                    Net = mp.FinancialDetails.Net,
                    ServiceTax = mp.FinancialDetails.ServiceTax,
                    FeeTotal = mp.FinancialDetails.FeeTotal,
                    BudgetOdcs = mp.FinancialDetails.BudgetOdcs,
                    BudgetStaff = mp.FinancialDetails.BudgetStaff,
                    BudgetSubTotal = mp.FinancialDetails.BudgetSubTotal,
                    ContractType = mp.FinancialDetails.ContractType,
                    Percentage = mp.FinancialDetails.Percentage
                } : null,
                ActualCost = mp.ContractAndCost != null ? new ContractAndCostDto
                {
                    ContractType = mp.ContractAndCost.ContractType,
                    Percentage = mp.ContractAndCost.Percentage,
                    PriorCumulativeOdc = mp.ContractAndCost.PriorCumulativeOdc,
                    PriorCumulativeStaff = mp.ContractAndCost.PriorCumulativeStaff,
                    PriorCumulativeTotal = mp.ContractAndCost.PriorCumulativeTotal,
                    ActualOdc = mp.ContractAndCost.ActualOdc,
                    ActualStaff = mp.ContractAndCost.ActualStaff,
                    ActualSubtotal = mp.ContractAndCost.ActualSubtotal,
                    TotalCumulativeOdc = mp.ContractAndCost.TotalCumulativeOdc,
                    TotalCumulativeStaff = mp.ContractAndCost.TotalCumulativeStaff,
                    TotalCumulativeCost = mp.ContractAndCost.TotalCumulativeCost
                } : null,
                CtcAndEac = mp.CTCEAC != null ? new CTCEACDto
                {
                    CtcODC = mp.CTCEAC.CtcODC,
                    CtcStaff = mp.CTCEAC.CtcStaff,
                    CtcSubtotal = mp.CTCEAC.CtcSubtotal,
                    ActualctcODC = mp.CTCEAC.ActualctcODC,
                    ActualCtcStaff = mp.CTCEAC.ActualCtcStaff,
                    ActualCtcSubtotal = mp.CTCEAC.ActualCtcSubtotal,
                    TotalEAC = mp.CTCEAC.TotalEAC,
                    GrossProfitPercentage = mp.CTCEAC.GrossProfitPercentage
                } : null,
                Schedule = mp.Schedule != null ? new ScheduleDto
                {
                    DateOfIssueWOLOI = mp.Schedule.DateOfIssueWOLOI,
                    CompletionDateAsPerContract = mp.Schedule.CompletionDateAsPerContract,
                    CompletionDateAsPerExtension = mp.Schedule.CompletionDateAsPerExtension,
                    ExpectedCompletionDate = mp.Schedule.ExpectedCompletionDate
                } : null,
                ManpowerPlanning = new ManpowerPlanningDto
                {
                    Manpower = mp.ManpowerEntries?.Select(mpe => new ManpowerDto
                    {
                        WorkAssignment = mpe.WorkAssignment,
                        Assignee = mpe.Assignee,
                        Planned = mpe.Planned,
                        Consumed = mpe.Consumed,
                        Balance = mpe.Balance,
                        NextMonthPlanning = mpe.NextMonthPlanning,
                        ManpowerComments = mpe.ManpowerComments
                    }).ToList(),
                    ManpowerTotal = new ManpowerTotalDto
                    {
                        PlannedTotal = mp.ManpowerEntries?.Sum(x => x.Planned),
                        ConsumedTotal = mp.ManpowerEntries?.Sum(x => x.Consumed),
                        BalanceTotal = mp.ManpowerEntries?.Sum(x => x.Balance),
                        NextMonthPlanningTotal = mp.ManpowerEntries?.Sum(x => x.NextMonthPlanning)
                    }
                },
                ProgressDeliverable = new ProgressDeliverableWrapperDto
                {
                    Deliverables = mp.ProgressDeliverables?.Select(pd => new ProgressDeliverableDto
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
                    TotalPaymentDue = mp.ProgressDeliverables?.Sum(pd => pd.PaymentDue) ?? 0
                },
                ChangeOrder = mp.ChangeOrders?.Select(co => new ChangeOrderDto
                {
                    ContractTotal = co.ContractTotal,
                    Cost = co.Cost,
                    Fee = co.Fee,
                    SummaryDetails = co.SummaryDetails,
                    Status = co.Status
                }).ToList(),
                ProgrammeSchedule = mp.ProgrammeSchedules?.Select(ps => new ProgrammeScheduleDto
                {
                    ProgrammeDescription = ps.ProgrammeDescription
                }).ToList(),
                EarlyWarnings = mp.EarlyWarnings?.Select(ew => new EarlyWarningDto
                {
                    WarningsDescription = ew.WarningsDescription
                }).ToList(),
                LastMonthActions = mp.LastMonthActions?.Select(lma => new LastMonthActionDto
                {
                    LMactions = lma.LMactions,
                    LMAdate = lma.LMAdate,
                    LMAcomments = lma.LMAcomments
                }).ToList(),
                CurrentMonthActions = mp.CurrentMonthActions?.Select(cma => new CurrentMonthActionDto
                {
                    CMactions = cma.CMactions,
                    CMAdate = cma.CMAdate,
                    CMAcomments = cma.CMAcomments,
                    CMApriority = cma.CMApriority
                }).ToList(),
                BudgetTable = mp.BudgetTable != null ? new BudgetTableDto
                {
                    OriginalBudget = mp.BudgetTable.OriginalBudget != null ? new OriginalBudgetDto
                    {
                        RevenueFee = mp.BudgetTable.OriginalBudget.RevenueFee,
                        Cost = mp.BudgetTable.OriginalBudget.Cost,
                        ProfitPercentage = mp.BudgetTable.OriginalBudget.ProfitPercentage
                    } : null,
                    CurrentBudgetInMIS = mp.BudgetTable.CurrentBudgetInMIS != null ? new CurrentBudgetInMISDto
                    {
                        RevenueFee = mp.BudgetTable.CurrentBudgetInMIS.RevenueFee,
                        Cost = mp.BudgetTable.CurrentBudgetInMIS.Cost,
                        ProfitPercentage = mp.BudgetTable.CurrentBudgetInMIS.ProfitPercentage
                    } : null,
                    PercentCompleteOnCosts = mp.BudgetTable.PercentCompleteOnCosts != null ? new PercentCompleteOnCostsDto
                    {
                        RevenueFee = mp.BudgetTable.PercentCompleteOnCosts.RevenueFee,
                        Cost = mp.BudgetTable.PercentCompleteOnCosts.Cost
                    } : null
                } : null
            }).ToList();
        }
    }
}
