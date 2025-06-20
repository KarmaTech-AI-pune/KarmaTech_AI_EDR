using MediatR;
using NJS.Application.CQRS.MonthlyProgress.Queries;
using NJS.Application.DTOs;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.MonthlyProgress.Handlers
{
    public class GetAllMonthlyProgressQueryHandler : IRequestHandler<GetAllMonthlyProgressQuery, List<MonthlyProgressDto>>
    {
        private readonly IMonthlyProgressRepository _monthlyProgressRepository;

        public GetAllMonthlyProgressQueryHandler(IMonthlyProgressRepository monthlyProgressRepository)
        {
            _monthlyProgressRepository = monthlyProgressRepository ?? throw new ArgumentNullException(nameof(monthlyProgressRepository));
        }

        public async Task<List<MonthlyProgressDto>> Handle(GetAllMonthlyProgressQuery request, CancellationToken cancellationToken)
        {
            // Assuming a GetAllAsync method exists or can be added to the repository
            // For now, let's assume GetByIdAsync can be adapted or a new method is needed.
            // Since IMonthlyProgressRepository only has GetByIdAsync, AddAsync, UpdateAsync, DeleteAsync,
            // I will need to assume a GetAllAsync or similar method would be added to the repository.
            // For demonstration, I'll simulate fetching all by assuming a method.
            // In a real scenario, I would add a GetAllAsync to IMonthlyProgressRepository and MonthlyProgressRepository.

            // For now, let's assume a method that returns all monthly progresses.
            // This part would need adjustment if the repository doesn't support GetAll.
            // For the purpose of this task, I will assume a GetAllAsync method exists or will be added.
            // If it doesn't exist, I would need to modify the IMonthlyProgressRepository and MonthlyProgressRepository.

            // Since the original plan only mentioned GetById and GetAll, and the repository interface only has GetById,
            // I will need to add a GetAllAsync method to the IMonthlyProgressRepository and its implementation.

            var monthlyProgressEntities = await _monthlyProgressRepository.GetAllAsync();

            if (monthlyProgressEntities == null || !monthlyProgressEntities.Any())
            {
                return new List<MonthlyProgressDto>();
            }

            // Manual mapping from entity to DTO
            return monthlyProgressEntities.Select(monthlyProgressEntity => new MonthlyProgressDto
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
                        Cost = monthlyProgressEntity.BudgetTable.PercentCompleteOnCosts.Cost,
                        ProfitPercentage = monthlyProgressEntity.BudgetTable.PercentCompleteOnCosts.ProfitPercentage
                    } : null
                } : null
            }).ToList();
        }
    }
}
