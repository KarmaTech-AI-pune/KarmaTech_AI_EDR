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
                    LumpSum = monthlyProgressEntity.ContractAndCost.LumpSum,
                    TimeAndExpense = monthlyProgressEntity.ContractAndCost.TimeAndExpense,
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
                ManpowerPlanning = monthlyProgressEntity.ManpowerPlanning != null ? new ManpowerPlanningDto
                {
                    WorkAssignment = monthlyProgressEntity.ManpowerPlanning.WorkAssignment,
                    Assignee = monthlyProgressEntity.ManpowerPlanning.Assignee,
                    Planned = monthlyProgressEntity.ManpowerPlanning.Planned,
                    Consumed = monthlyProgressEntity.ManpowerPlanning.Consumed,
                    Balance = monthlyProgressEntity.ManpowerPlanning.Balance,
                    NextMonthPlanning = monthlyProgressEntity.ManpowerPlanning.NextMonthPlanning,
                    ManpowerComments = monthlyProgressEntity.ManpowerPlanning.ManpowerComments
                } : null,
                ProgressDeliverable = monthlyProgressEntity.ProgressDeliverable != null ? new ProgressDeliverableDto
                {
                    Milestone = monthlyProgressEntity.ProgressDeliverable.Milestone,
                    DueDateContract = monthlyProgressEntity.ProgressDeliverable.DueDateContract,
                    DueDatePlanned = monthlyProgressEntity.ProgressDeliverable.DueDatePlanned,
                    AchievedDate = monthlyProgressEntity.ProgressDeliverable.AchievedDate,
                    PaymentDue = monthlyProgressEntity.ProgressDeliverable.PaymentDue,
                    InvoiceDate = monthlyProgressEntity.ProgressDeliverable.InvoiceDate,
                    PaymentReceivedDate = monthlyProgressEntity.ProgressDeliverable.PaymentReceivedDate,
                    DeliverableComments = monthlyProgressEntity.ProgressDeliverable.DeliverableComments
                } : null,
                ChangeOrder = monthlyProgressEntity.ChangeOrder != null ? new ChangeOrderDto
                {
                    ContractTotal = monthlyProgressEntity.ChangeOrder.ContractTotal,
                    Cost = monthlyProgressEntity.ChangeOrder.Cost,
                    Fee = monthlyProgressEntity.ChangeOrder.Fee,
                    SummaryDetails = monthlyProgressEntity.ChangeOrder.SummaryDetails,
                    Status = monthlyProgressEntity.ChangeOrder.Status
                } : null,
                LastMonthAction = monthlyProgressEntity.LastMonthAction != null ? new LastMonthActionDto
                {
                    LMactions = monthlyProgressEntity.LastMonthAction.LMactions,
                    LMAdate = monthlyProgressEntity.LastMonthAction.LMAdate,
                    LMAcomments = monthlyProgressEntity.LastMonthAction.LMAcomments
                } : null,
                CurrentMonthAction = monthlyProgressEntity.CurrentMonthAction != null ? new CurrentMonthActionDto
                {
                    CMactions = monthlyProgressEntity.CurrentMonthAction.CMactions,
                    CMAdate = monthlyProgressEntity.CurrentMonthAction.CMAdate,
                    CMAcomments = monthlyProgressEntity.CurrentMonthAction.CMAcomments,
                    CMApriority = monthlyProgressEntity.CurrentMonthAction.CMApriority
                } : null
            }).ToList();
        }
    }
}
