using MediatR;
using NJS.Application.CQRS.MonthlyProgress.Commands;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
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
            if (request == null || request.MonthlyProgress == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            var monthlyProgressEntity = new NJS.Domain.Entities.MonthlyProgress
            {
                CreatedDate = DateTime.UtcNow,
                FinancialDetails = request.MonthlyProgress.FinancialDetails != null ? new FinancialDetails
                {
                    Net = request.MonthlyProgress.FinancialDetails.Net,
                    ServiceTax = request.MonthlyProgress.FinancialDetails.ServiceTax,
                    FeeTotal = request.MonthlyProgress.FinancialDetails.FeeTotal,
                    BudgetOdcs = request.MonthlyProgress.FinancialDetails.BudgetOdcs,
                    BudgetStaff = request.MonthlyProgress.FinancialDetails.BudgetStaff,
                    BudgetSubTotal = request.MonthlyProgress.FinancialDetails.BudgetSubTotal
                } : null,
                ContractAndCost = request.MonthlyProgress.ContractAndCost != null ? new ContractAndCost
                {
                    LumpSum = request.MonthlyProgress.ContractAndCost.LumpSum,
                    TimeAndExpense = request.MonthlyProgress.ContractAndCost.TimeAndExpense,
                    Percentage = request.MonthlyProgress.ContractAndCost.Percentage,
                    ActualOdcs = request.MonthlyProgress.ContractAndCost.ActualOdcs,
                    ActualStaff = request.MonthlyProgress.ContractAndCost.ActualStaff,
                    ActualSubtotal = request.MonthlyProgress.ContractAndCost.ActualSubtotal
                } : null,
                CTCEAC = request.MonthlyProgress.CTCEAC != null ? new CTCEAC
                {
                    CtcODC = request.MonthlyProgress.CTCEAC.CtcODC,
                    CtcStaff = request.MonthlyProgress.CTCEAC.CtcStaff,
                    CtcSubtotal = request.MonthlyProgress.CTCEAC.CtcSubtotal,
                    TotalEAC = request.MonthlyProgress.CTCEAC.TotalEAC,
                    GrossProfitPercentage = request.MonthlyProgress.CTCEAC.GrossProfitPercentage
                } : null,
                Schedule = request.MonthlyProgress.Schedule != null ? new Schedule
                {
                    DateOfIssueWOLOI = request.MonthlyProgress.Schedule.DateOfIssueWOLOI,
                    CompletionDateAsPerContract = request.MonthlyProgress.Schedule.CompletionDateAsPerContract,
                    CompletionDateAsPerExtension = request.MonthlyProgress.Schedule.CompletionDateAsPerExtension,
                    ExpectedCompletionDate = request.MonthlyProgress.Schedule.ExpectedCompletionDate
                } : null,
                ManpowerPlanning = request.MonthlyProgress.ManpowerPlanning != null ? new ManpowerPlanning
                {
                    WorkAssignment = request.MonthlyProgress.ManpowerPlanning.WorkAssignment,
                    Assignee = request.MonthlyProgress.ManpowerPlanning.Assignee,
                    Planned = request.MonthlyProgress.ManpowerPlanning.Planned,
                    Consumed = request.MonthlyProgress.ManpowerPlanning.Consumed,
                    Balance = request.MonthlyProgress.ManpowerPlanning.Balance,
                    NextMonthPlanning = request.MonthlyProgress.ManpowerPlanning.NextMonthPlanning,
                    ManpowerComments = request.MonthlyProgress.ManpowerPlanning.ManpowerComments
                } : null,
                ProgressDeliverable = request.MonthlyProgress.ProgressDeliverable != null ? new ProgressDeliverable
                {
                    Milestone = request.MonthlyProgress.ProgressDeliverable.Milestone,
                    DueDateContract = request.MonthlyProgress.ProgressDeliverable.DueDateContract,
                    DueDatePlanned = request.MonthlyProgress.ProgressDeliverable.DueDatePlanned,
                    AchievedDate = request.MonthlyProgress.ProgressDeliverable.AchievedDate,
                    PaymentDue = request.MonthlyProgress.ProgressDeliverable.PaymentDue,
                    InvoiceDate = request.MonthlyProgress.ProgressDeliverable.InvoiceDate,
                    PaymentReceivedDate = request.MonthlyProgress.ProgressDeliverable.PaymentReceivedDate,
                    DeliverableComments = request.MonthlyProgress.ProgressDeliverable.DeliverableComments
                } : null,
                ChangeOrder = request.MonthlyProgress.ChangeOrder != null ? new ChangeOrder
                {
                    ContractTotal = request.MonthlyProgress.ChangeOrder.ContractTotal,
                    Cost = request.MonthlyProgress.ChangeOrder.Cost,
                    Fee = request.MonthlyProgress.ChangeOrder.Fee,
                    SummaryDetails = request.MonthlyProgress.ChangeOrder.SummaryDetails,
                    Status = request.MonthlyProgress.ChangeOrder.Status
                } : null,
                LastMonthAction = request.MonthlyProgress.LastMonthAction != null ? new LastMonthAction
                {
                    LMactions = request.MonthlyProgress.LastMonthAction.LMactions,
                    LMAdate = request.MonthlyProgress.LastMonthAction.LMAdate,
                    LMAcomments = request.MonthlyProgress.LastMonthAction.LMAcomments
                } : null,
                CurrentMonthAction = request.MonthlyProgress.CurrentMonthAction != null ? new CurrentMonthAction
                {
                    CMactions = request.MonthlyProgress.CurrentMonthAction.CMactions,
                    CMAdate = request.MonthlyProgress.CurrentMonthAction.CMAdate,
                    CMAcomments = request.MonthlyProgress.CurrentMonthAction.CMAcomments,
                    CMApriority = request.MonthlyProgress.CurrentMonthAction.CMApriority
                } : null
            };

            await _monthlyProgressRepository.AddAsync(monthlyProgressEntity);

            return monthlyProgressEntity.Id;
        }
    }
}
