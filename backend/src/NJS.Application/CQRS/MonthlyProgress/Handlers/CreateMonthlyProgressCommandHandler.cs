using MediatR;
using NJS.Application.CQRS.MonthlyProgress.Commands;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.MonthlyProgress.Handlers
{
    public class CreateMonthlyProgressCommandHandler : IRequestHandler<CreateMonthlyProgressCommand, int>
    {
        private readonly IMonthlyProgressRepository _monthlyProgressRepository;

        public CreateMonthlyProgressCommandHandler(IMonthlyProgressRepository monthlyProgressRepository)
        {
            _monthlyProgressRepository = monthlyProgressRepository ?? throw new ArgumentNullException(nameof(monthlyProgressRepository));
        }

        public async Task<int> Handle(CreateMonthlyProgressCommand request, CancellationToken cancellationToken)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            var monthlyProgressEntity = new NJS.Domain.Entities.MonthlyProgress
            {
                ProjectId = request.ProjectId,
                CreatedDate = DateTime.UtcNow,
                Month = request.MonthlyProgress?.Month ?? DateTime.UtcNow.Month,
                Year = request.MonthlyProgress?.Year ?? DateTime.UtcNow.Year,
                FinancialDetails = request.MonthlyProgress?.FinancialAndContractDetails != null ? new FinancialDetails
                {
                    Net = request.MonthlyProgress.FinancialAndContractDetails.Net,
                    ServiceTax = request.MonthlyProgress.FinancialAndContractDetails.ServiceTax,
                    FeeTotal = request.MonthlyProgress.FinancialAndContractDetails.FeeTotal,
                    BudgetOdcs = request.MonthlyProgress.FinancialAndContractDetails.BudgetOdcs,
                    BudgetStaff = request.MonthlyProgress.FinancialAndContractDetails.BudgetStaff,
                    BudgetSubTotal = request.MonthlyProgress.FinancialAndContractDetails.BudgetSubTotal,
                    ContractType = request.MonthlyProgress.FinancialAndContractDetails.ContractType ?? "",
                    Percentage = request.MonthlyProgress.FinancialAndContractDetails.Percentage
                } : null,
                ContractAndCost = request.MonthlyProgress?.ActualCost != null ? new ContractAndCost
                {
                    ContractType = request.MonthlyProgress.ActualCost.ContractType ?? "",
                    Percentage = request.MonthlyProgress.ActualCost.Percentage,
                    PriorCumulativeOdc = request.MonthlyProgress.ActualCost.PriorCumulativeOdc,
                    PriorCumulativeStaff = request.MonthlyProgress.ActualCost.PriorCumulativeStaff,
                    PriorCumulativeTotal = request.MonthlyProgress.ActualCost.PriorCumulativeTotal,
                    ActualOdc = request.MonthlyProgress.ActualCost.ActualOdc,
                    ActualStaff = request.MonthlyProgress.ActualCost.ActualStaff,
                    ActualSubtotal = request.MonthlyProgress.ActualCost.ActualSubtotal,
                    TotalCumulativeOdc = request.MonthlyProgress.ActualCost.TotalCumulativeOdc,
                    TotalCumulativeStaff = request.MonthlyProgress.ActualCost.TotalCumulativeStaff,
                    TotalCumulativeCost = request.MonthlyProgress.ActualCost.TotalCumulativeCost
                } : null,
                CTCEAC = request.MonthlyProgress?.CtcAndEac != null ? new CTCEAC
                {
                    CtcODC = request.MonthlyProgress.CtcAndEac.CtcODC,
                    CtcStaff = request.MonthlyProgress.CtcAndEac.CtcStaff,
                    CtcSubtotal = request.MonthlyProgress.CtcAndEac.CtcSubtotal,
                    ActualctcODC = request.MonthlyProgress.CtcAndEac.ActualctcODC,
                    ActualCtcStaff = request.MonthlyProgress.CtcAndEac.ActualCtcStaff,
                    ActualCtcSubtotal = request.MonthlyProgress.CtcAndEac.ActualCtcSubtotal,
                    TotalEAC = request.MonthlyProgress.CtcAndEac.TotalEAC,
                    GrossProfitPercentage = request.MonthlyProgress.CtcAndEac.GrossProfitPercentage
                } : null,
                Schedule = request.MonthlyProgress?.Schedule != null ? new Schedule
                {
                    DateOfIssueWOLOI = request.MonthlyProgress.Schedule.DateOfIssueWOLOI,
                    CompletionDateAsPerContract = request.MonthlyProgress.Schedule.CompletionDateAsPerContract,
                    CompletionDateAsPerExtension = request.MonthlyProgress.Schedule.CompletionDateAsPerExtension,
                    ExpectedCompletionDate = request.MonthlyProgress.Schedule.ExpectedCompletionDate
                } : null,
                ManpowerEntries = request.MonthlyProgress?.ManpowerPlanning?.Manpower != null ?
                    request.MonthlyProgress.ManpowerPlanning.Manpower.Select(mp => new ManpowerPlanning
                    {
                        WorkAssignment = mp.WorkAssignment,
                        Assignee = mp.Assignee,
                        Planned = mp.Planned ?? 0m,
                        Consumed = mp.Consumed ?? 0m,
                        Balance = mp.Balance ?? 0m,
                        NextMonthPlanning = mp.NextMonthPlanning ?? 0m,
                        ManpowerComments = mp.ManpowerComments
                    }).ToList() : new List<ManpowerPlanning>(),
                ProgressDeliverables = request.MonthlyProgress?.ProgressDeliverable?.Deliverables != null ?
                    request.MonthlyProgress.ProgressDeliverable.Deliverables.Select(pd => new ProgressDeliverable
                    {
                        Milestone = pd.Milestone,
                        DueDateContract = pd.DueDateContract,
                        DueDatePlanned = pd.DueDatePlanned,
                        AchievedDate = pd.AchievedDate,
                        PaymentDue = pd.PaymentDue,
                        InvoiceDate = pd.InvoiceDate,
                        PaymentReceivedDate = pd.PaymentReceivedDate,
                        DeliverableComments = pd.DeliverableComments
                    }).ToList() : new List<ProgressDeliverable>(),
                ChangeOrders = request.MonthlyProgress?.ChangeOrder != null ?
                    request.MonthlyProgress.ChangeOrder.Select(co => new ChangeOrder
                    {
                        ContractTotal = co.ContractTotal,
                        Cost = co.Cost,
                        Fee = co.Fee,
                        SummaryDetails = co.SummaryDetails,
                        Status = co.Status
                    }).ToList() : new List<ChangeOrder>(),
                LastMonthActions = request.MonthlyProgress?.LastMonthActions != null ?
                    request.MonthlyProgress.LastMonthActions.Select(lma => new LastMonthAction
                    {
                        LMactions = lma.LMactions,
                        LMAdate = lma.LMAdate,
                        LMAcomments = lma.LMAcomments
                    }).ToList() : new List<LastMonthAction>(),
                CurrentMonthActions = request.MonthlyProgress?.CurrentMonthActions != null ?
                    request.MonthlyProgress.CurrentMonthActions.Select(cma => new CurrentMonthAction
                    {
                        CMactions = cma.CMactions,
                        CMAdate = cma.CMAdate,
                        CMAcomments = cma.CMAcomments,
                        CMApriority = cma.CMApriority
                    }).ToList() : new List<CurrentMonthAction>(),
                ProgrammeSchedules = request.MonthlyProgress?.ProgrammeSchedule != null ?
                    request.MonthlyProgress.ProgrammeSchedule.Select(ps => new ProgrammeSchedule
                    {
                        ProgrammeDescription = ps.ProgrammeDescription
                    }).ToList() : new List<ProgrammeSchedule>(),
                EarlyWarnings = request.MonthlyProgress?.EarlyWarnings != null ?
                    request.MonthlyProgress.EarlyWarnings.Select(ew => new EarlyWarning
                    {
                        WarningsDescription = ew.WarningsDescription
                    }).ToList() : new List<EarlyWarning>(),
                BudgetTable = request.MonthlyProgress.BudgetTable != null ? new BudgetTable
                {
                    OriginalBudget = request.MonthlyProgress.BudgetTable.OriginalBudget != null ? new OriginalBudget
                    {
                        RevenueFee = request.MonthlyProgress.BudgetTable.OriginalBudget.RevenueFee,
                        Cost = request.MonthlyProgress.BudgetTable.OriginalBudget.Cost,
                        ProfitPercentage = request.MonthlyProgress.BudgetTable.OriginalBudget.ProfitPercentage
                    } : null,
                    CurrentBudgetInMIS = request.MonthlyProgress.BudgetTable.CurrentBudgetInMIS != null ? new CurrentBudgetInMIS
                    {
                        RevenueFee = request.MonthlyProgress.BudgetTable.CurrentBudgetInMIS.RevenueFee,
                        Cost = request.MonthlyProgress.BudgetTable.CurrentBudgetInMIS.Cost,
                        ProfitPercentage = request.MonthlyProgress.BudgetTable.CurrentBudgetInMIS.ProfitPercentage
                    } : null,
                    PercentCompleteOnCosts = request.MonthlyProgress.BudgetTable.PercentCompleteOnCosts != null ? new PercentCompleteOnCosts
                    {
                        RevenueFee = request.MonthlyProgress.BudgetTable.PercentCompleteOnCosts.RevenueFee,
                        Cost = request.MonthlyProgress.BudgetTable.PercentCompleteOnCosts.Cost
                    } : null
                } : null
            };

            await _monthlyProgressRepository.AddAsync(monthlyProgressEntity);

            return monthlyProgressEntity.Id;
        }
    }
}
