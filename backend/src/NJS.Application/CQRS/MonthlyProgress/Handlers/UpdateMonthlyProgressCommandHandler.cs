using MediatR;
using NJS.Application.CQRS.MonthlyProgress.Commands;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.MonthlyProgress.Handlers
{
    public class UpdateMonthlyProgressCommandHandler : IRequestHandler<UpdateMonthlyProgressCommand, bool>
    {
        private readonly IMonthlyProgressRepository _monthlyProgressRepository;

        public UpdateMonthlyProgressCommandHandler(IMonthlyProgressRepository monthlyProgressRepository)
        {
            _monthlyProgressRepository = monthlyProgressRepository ?? throw new ArgumentNullException(nameof(monthlyProgressRepository));
        }

        public async Task<bool> Handle(UpdateMonthlyProgressCommand request, CancellationToken cancellationToken)
        {
            if (request == null || request.MonthlyProgress == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            var existingMonthlyProgress = await _monthlyProgressRepository.GetByIdAsync(request.Id);

            if (existingMonthlyProgress == null)
            {
                return false; // MonthlyProgress not found
            }

            // Update properties of the main MonthlyProgress entity
            // CreatedDate is typically set on creation and not updated via DTO

            // Update FinancialDetails
            if (request.MonthlyProgress.FinancialDetails != null)
            {
                if (existingMonthlyProgress.FinancialDetails == null)
                {
                    existingMonthlyProgress.FinancialDetails = new FinancialDetails();
                }
                existingMonthlyProgress.FinancialDetails.Net = request.MonthlyProgress.FinancialDetails.Net;
                existingMonthlyProgress.FinancialDetails.ServiceTax = request.MonthlyProgress.FinancialDetails.ServiceTax;
                existingMonthlyProgress.FinancialDetails.FeeTotal = request.MonthlyProgress.FinancialDetails.FeeTotal;
                existingMonthlyProgress.FinancialDetails.BudgetOdcs = request.MonthlyProgress.FinancialDetails.BudgetOdcs;
                existingMonthlyProgress.FinancialDetails.BudgetStaff = request.MonthlyProgress.FinancialDetails.BudgetStaff;
                existingMonthlyProgress.FinancialDetails.BudgetSubTotal = request.MonthlyProgress.FinancialDetails.BudgetSubTotal;
            }
            else if (existingMonthlyProgress.FinancialDetails != null)
            {
                // If DTO has null but entity has existing, remove it (or handle as per business logic)
                existingMonthlyProgress.FinancialDetails = null;
            }

            // Update ContractAndCost
            if (request.MonthlyProgress.ContractAndCost != null)
            {
                if (existingMonthlyProgress.ContractAndCost == null)
                {
                    existingMonthlyProgress.ContractAndCost = new ContractAndCost();
                }
                existingMonthlyProgress.ContractAndCost.LumpSum = request.MonthlyProgress.ContractAndCost.LumpSum;
                existingMonthlyProgress.ContractAndCost.TimeAndExpense = request.MonthlyProgress.ContractAndCost.TimeAndExpense;
                existingMonthlyProgress.ContractAndCost.Percentage = request.MonthlyProgress.ContractAndCost.Percentage;
                existingMonthlyProgress.ContractAndCost.ActualOdcs = request.MonthlyProgress.ContractAndCost.ActualOdcs;
                existingMonthlyProgress.ContractAndCost.ActualStaff = request.MonthlyProgress.ContractAndCost.ActualStaff;
                existingMonthlyProgress.ContractAndCost.ActualSubtotal = request.MonthlyProgress.ContractAndCost.ActualSubtotal;
            }
            else if (existingMonthlyProgress.ContractAndCost != null)
            {
                existingMonthlyProgress.ContractAndCost = null;
            }

            // Update CTCEAC
            if (request.MonthlyProgress.CTCEAC != null)
            {
                if (existingMonthlyProgress.CTCEAC == null)
                {
                    existingMonthlyProgress.CTCEAC = new CTCEAC();
                }
                existingMonthlyProgress.CTCEAC.CtcODC = request.MonthlyProgress.CTCEAC.CtcODC;
                existingMonthlyProgress.CTCEAC.CtcStaff = request.MonthlyProgress.CTCEAC.CtcStaff;
                existingMonthlyProgress.CTCEAC.CtcSubtotal = request.MonthlyProgress.CTCEAC.CtcSubtotal;
                existingMonthlyProgress.CTCEAC.TotalEAC = request.MonthlyProgress.CTCEAC.TotalEAC;
                existingMonthlyProgress.CTCEAC.GrossProfitPercentage = request.MonthlyProgress.CTCEAC.GrossProfitPercentage;
            }
            else if (existingMonthlyProgress.CTCEAC != null)
            {
                existingMonthlyProgress.CTCEAC = null;
            }

            // Update Schedule
            if (request.MonthlyProgress.Schedule != null)
            {
                if (existingMonthlyProgress.Schedule == null)
                {
                    existingMonthlyProgress.Schedule = new Schedule();
                }
                existingMonthlyProgress.Schedule.DateOfIssueWOLOI = request.MonthlyProgress.Schedule.DateOfIssueWOLOI;
                existingMonthlyProgress.Schedule.CompletionDateAsPerContract = request.MonthlyProgress.Schedule.CompletionDateAsPerContract;
                existingMonthlyProgress.Schedule.CompletionDateAsPerExtension = request.MonthlyProgress.Schedule.CompletionDateAsPerExtension;
                existingMonthlyProgress.Schedule.ExpectedCompletionDate = request.MonthlyProgress.Schedule.ExpectedCompletionDate;
            }
            else if (existingMonthlyProgress.Schedule != null)
            {
                existingMonthlyProgress.Schedule = null;
            }

            // Update ManpowerPlanning
            if (request.MonthlyProgress.ManpowerPlanning != null)
            {
                if (existingMonthlyProgress.ManpowerPlanning == null)
                {
                    existingMonthlyProgress.ManpowerPlanning = new ManpowerPlanning();
                }
                existingMonthlyProgress.ManpowerPlanning.WorkAssignment = request.MonthlyProgress.ManpowerPlanning.WorkAssignment;
                existingMonthlyProgress.ManpowerPlanning.Assignee = request.MonthlyProgress.ManpowerPlanning.Assignee;
                existingMonthlyProgress.ManpowerPlanning.Planned = request.MonthlyProgress.ManpowerPlanning.Planned;
                existingMonthlyProgress.ManpowerPlanning.Consumed = request.MonthlyProgress.ManpowerPlanning.Consumed;
                existingMonthlyProgress.ManpowerPlanning.Balance = request.MonthlyProgress.ManpowerPlanning.Balance;
                existingMonthlyProgress.ManpowerPlanning.NextMonthPlanning = request.MonthlyProgress.ManpowerPlanning.NextMonthPlanning;
                existingMonthlyProgress.ManpowerPlanning.ManpowerComments = request.MonthlyProgress.ManpowerPlanning.ManpowerComments;
            }
            else if (existingMonthlyProgress.ManpowerPlanning != null)
            {
                existingMonthlyProgress.ManpowerPlanning = null;
            }

            // Update ProgressDeliverable
            if (request.MonthlyProgress.ProgressDeliverable != null)
            {
                if (existingMonthlyProgress.ProgressDeliverable == null)
                {
                    existingMonthlyProgress.ProgressDeliverable = new ProgressDeliverable();
                }
                existingMonthlyProgress.ProgressDeliverable.Milestone = request.MonthlyProgress.ProgressDeliverable.Milestone;
                existingMonthlyProgress.ProgressDeliverable.DueDateContract = request.MonthlyProgress.ProgressDeliverable.DueDateContract;
                existingMonthlyProgress.ProgressDeliverable.DueDatePlanned = request.MonthlyProgress.ProgressDeliverable.DueDatePlanned;
                existingMonthlyProgress.ProgressDeliverable.AchievedDate = request.MonthlyProgress.ProgressDeliverable.AchievedDate;
                existingMonthlyProgress.ProgressDeliverable.PaymentDue = request.MonthlyProgress.ProgressDeliverable.PaymentDue;
                existingMonthlyProgress.ProgressDeliverable.InvoiceDate = request.MonthlyProgress.ProgressDeliverable.InvoiceDate;
                existingMonthlyProgress.ProgressDeliverable.PaymentReceivedDate = request.MonthlyProgress.ProgressDeliverable.PaymentReceivedDate;
                existingMonthlyProgress.ProgressDeliverable.DeliverableComments = request.MonthlyProgress.ProgressDeliverable.DeliverableComments;
            }
            else if (existingMonthlyProgress.ProgressDeliverable != null)
            {
                existingMonthlyProgress.ProgressDeliverable = null;
            }

            // Update ChangeOrder
            if (request.MonthlyProgress.ChangeOrder != null)
            {
                if (existingMonthlyProgress.ChangeOrder == null)
                {
                    existingMonthlyProgress.ChangeOrder = new ChangeOrder();
                }
                existingMonthlyProgress.ChangeOrder.ContractTotal = request.MonthlyProgress.ChangeOrder.ContractTotal;
                existingMonthlyProgress.ChangeOrder.Cost = request.MonthlyProgress.ChangeOrder.Cost;
                existingMonthlyProgress.ChangeOrder.Fee = request.MonthlyProgress.ChangeOrder.Fee;
                existingMonthlyProgress.ChangeOrder.SummaryDetails = request.MonthlyProgress.ChangeOrder.SummaryDetails;
                existingMonthlyProgress.ChangeOrder.Status = request.MonthlyProgress.ChangeOrder.Status;
            }
            else if (existingMonthlyProgress.ChangeOrder != null)
            {
                existingMonthlyProgress.ChangeOrder = null;
            }

            // Update LastMonthAction
            if (request.MonthlyProgress.LastMonthAction != null)
            {
                if (existingMonthlyProgress.LastMonthAction == null)
                {
                    existingMonthlyProgress.LastMonthAction = new LastMonthAction();
                }
                existingMonthlyProgress.LastMonthAction.LMactions = request.MonthlyProgress.LastMonthAction.LMactions;
                existingMonthlyProgress.LastMonthAction.LMAdate = request.MonthlyProgress.LastMonthAction.LMAdate;
                existingMonthlyProgress.LastMonthAction.LMAcomments = request.MonthlyProgress.LastMonthAction.LMAcomments;
            }
            else if (existingMonthlyProgress.LastMonthAction != null)
            {
                existingMonthlyProgress.LastMonthAction = null;
            }

            // Update CurrentMonthAction
            if (request.MonthlyProgress.CurrentMonthAction != null)
            {
                if (existingMonthlyProgress.CurrentMonthAction == null)
                {
                    existingMonthlyProgress.CurrentMonthAction = new CurrentMonthAction();
                }
                existingMonthlyProgress.CurrentMonthAction.CMactions = request.MonthlyProgress.CurrentMonthAction.CMactions;
                existingMonthlyProgress.CurrentMonthAction.CMAdate = request.MonthlyProgress.CurrentMonthAction.CMAdate;
                existingMonthlyProgress.CurrentMonthAction.CMAcomments = request.MonthlyProgress.CurrentMonthAction.CMAcomments;
                existingMonthlyProgress.CurrentMonthAction.CMApriority = request.MonthlyProgress.CurrentMonthAction.CMApriority;
            }
            else if (existingMonthlyProgress.CurrentMonthAction != null)
            {
                existingMonthlyProgress.CurrentMonthAction = null;
            }

            await _monthlyProgressRepository.UpdateAsync(existingMonthlyProgress);

            return true;
        }
    }
}
