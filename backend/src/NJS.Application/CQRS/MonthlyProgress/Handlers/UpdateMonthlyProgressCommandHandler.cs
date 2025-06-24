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

            // Update ManpowerEntries (collection)
            if (request.MonthlyProgress.ManpowerEntries != null)
            {
                if (existingMonthlyProgress.ManpowerEntries == null)
                {
                    existingMonthlyProgress.ManpowerEntries = new List<ManpowerPlanning>();
                }

                // Remove entries not present in the request
                var manpowerEntriesToRemove = existingMonthlyProgress.ManpowerEntries
                    .Where(existingEntry => !request.MonthlyProgress.ManpowerEntries.Any(dto => dto.WorkAssignment == existingEntry.WorkAssignment))
                    .ToList();

                foreach (var entryToRemove in manpowerEntriesToRemove)
                {
                    existingMonthlyProgress.ManpowerEntries.Remove(entryToRemove);
                }

                foreach (var manpowerDto in request.MonthlyProgress.ManpowerEntries)
                {
                    var existingEntry = existingMonthlyProgress.ManpowerEntries.FirstOrDefault(e => e.WorkAssignment == manpowerDto.WorkAssignment);

                    if (existingEntry == null)
                    {
                        // Add new entry
                        existingMonthlyProgress.ManpowerEntries.Add(new ManpowerPlanning
                        {
                            WorkAssignment = manpowerDto.WorkAssignment,
                            Assignee = manpowerDto.AssigneesJson, // Map AssigneesJson to Assignee
                            Planned = manpowerDto.Planned ?? 0,
                            Consumed = manpowerDto.Consumed ?? 0,
                            Balance = manpowerDto.Balance ?? 0,
                            NextMonthPlanning = manpowerDto.NextMonthPlanning ?? 0,
                            ManpowerComments = manpowerDto.ManpowerComments
                        });
                    }
                    else
                    {
                        // Update existing entry
                        existingEntry.Assignee = manpowerDto.AssigneesJson;
                        existingEntry.Planned = manpowerDto.Planned ?? existingEntry.Planned;
                        existingEntry.Consumed = manpowerDto.Consumed ?? existingEntry.Consumed;
                        existingEntry.Balance = manpowerDto.Balance ?? existingEntry.Balance;
                        existingEntry.NextMonthPlanning = manpowerDto.NextMonthPlanning ?? existingEntry.NextMonthPlanning;
                        existingEntry.ManpowerComments = manpowerDto.ManpowerComments;
                    }
                }
            }
            else if (existingMonthlyProgress.ManpowerEntries != null)
            {
                existingMonthlyProgress.ManpowerEntries.Clear();
            }
            existingMonthlyProgress.ManpowerTotal = request.MonthlyProgress.ManpowerTotal;

            // Update ProgressDeliverables (collection)
            if (request.MonthlyProgress.ProgressDeliverables != null)
            {
                if (existingMonthlyProgress.ProgressDeliverables == null)
                {
                    existingMonthlyProgress.ProgressDeliverables = new List<ProgressDeliverable>();
                }

                // Remove entries not present in the request
                var deliverablesToRemove = existingMonthlyProgress.ProgressDeliverables
                    .Where(existingEntry => !request.MonthlyProgress.ProgressDeliverables.Any(dto => dto.Milestone == existingEntry.Milestone))
                    .ToList();

                foreach (var entryToRemove in deliverablesToRemove)
                {
                    existingMonthlyProgress.ProgressDeliverables.Remove(entryToRemove);
                }

                foreach (var deliverableDto in request.MonthlyProgress.ProgressDeliverables)
                {
                    var existingEntry = existingMonthlyProgress.ProgressDeliverables.FirstOrDefault(e => e.Milestone == deliverableDto.Milestone);

                    if (existingEntry == null)
                    {
                        // Add new entry
                        existingMonthlyProgress.ProgressDeliverables.Add(new ProgressDeliverable
                        {
                            Milestone = deliverableDto.Milestone,
                            DueDateContract = deliverableDto.DueDateContract,
                            DueDatePlanned = deliverableDto.DueDatePlanned,
                            AchievedDate = deliverableDto.AchievedDate,
                            PaymentDue = deliverableDto.PaymentDue,
                            InvoiceDate = deliverableDto.InvoiceDate,
                            PaymentReceivedDate = deliverableDto.PaymentReceivedDate,
                            DeliverableComments = deliverableDto.DeliverableComments
                        });
                    }
                    else
                    {
                        // Update existing entry
                        existingEntry.DueDateContract = deliverableDto.DueDateContract;
                        existingEntry.DueDatePlanned = deliverableDto.DueDatePlanned;
                        existingEntry.AchievedDate = deliverableDto.AchievedDate;
                        existingEntry.PaymentDue = deliverableDto.PaymentDue;
                        existingEntry.InvoiceDate = deliverableDto.InvoiceDate;
                        existingEntry.PaymentReceivedDate = deliverableDto.PaymentReceivedDate;
                        existingEntry.DeliverableComments = deliverableDto.DeliverableComments;
                    }
                }
            }
            else if (existingMonthlyProgress.ProgressDeliverables != null)
            {
                existingMonthlyProgress.ProgressDeliverables.Clear();
            }

            // Update ChangeOrders (collection)
            if (request.MonthlyProgress.ChangeOrders != null)
            {
                if (existingMonthlyProgress.ChangeOrders == null)
                {
                    existingMonthlyProgress.ChangeOrders = new List<ChangeOrder>();
                }

                // Remove entries not present in the request
                var changeOrdersToRemove = existingMonthlyProgress.ChangeOrders
                    .Where(existingEntry => !request.MonthlyProgress.ChangeOrders.Any(dto => dto.SummaryDetails == existingEntry.SummaryDetails))
                    .ToList();

                foreach (var entryToRemove in changeOrdersToRemove)
                {
                    existingMonthlyProgress.ChangeOrders.Remove(entryToRemove);
                }

                foreach (var changeOrderDto in request.MonthlyProgress.ChangeOrders)
                {
                    var existingEntry = existingMonthlyProgress.ChangeOrders.FirstOrDefault(e => e.SummaryDetails == changeOrderDto.SummaryDetails);

                    if (existingEntry == null)
                    {
                        // Add new entry
                        existingMonthlyProgress.ChangeOrders.Add(new ChangeOrder
                        {
                            ContractTotal = changeOrderDto.ContractTotal,
                            Cost = changeOrderDto.Cost,
                            Fee = changeOrderDto.Fee,
                            SummaryDetails = changeOrderDto.SummaryDetails,
                            Status = changeOrderDto.Status
                        });
                    }
                    else
                    {
                        // Update existing entry
                        existingEntry.ContractTotal = changeOrderDto.ContractTotal;
                        existingEntry.Cost = changeOrderDto.Cost;
                        existingEntry.Fee = changeOrderDto.Fee;
                        existingEntry.SummaryDetails = changeOrderDto.SummaryDetails;
                        existingEntry.Status = changeOrderDto.Status;
                    }
                }
            }
            else if (existingMonthlyProgress.ChangeOrders != null)
            {
                existingMonthlyProgress.ChangeOrders.Clear();
            }

            // Update LastMonthActions (collection)
            if (request.MonthlyProgress.LastMonthActions != null)
            {
                if (existingMonthlyProgress.LastMonthActions == null)
                {
                    existingMonthlyProgress.LastMonthActions = new List<LastMonthAction>();
                }

                // Remove entries not present in the request
                var lastMonthActionsToRemove = existingMonthlyProgress.LastMonthActions
                    .Where(existingEntry => !request.MonthlyProgress.LastMonthActions.Any(dto => dto.LMactions == existingEntry.LMactions))
                    .ToList();

                foreach (var entryToRemove in lastMonthActionsToRemove)
                {
                    existingMonthlyProgress.LastMonthActions.Remove(entryToRemove);
                }

                foreach (var lastMonthActionDto in request.MonthlyProgress.LastMonthActions)
                {
                    var existingEntry = existingMonthlyProgress.LastMonthActions.FirstOrDefault(e => e.LMactions == lastMonthActionDto.LMactions);

                    if (existingEntry == null)
                    {
                        // Add new entry
                        existingMonthlyProgress.LastMonthActions.Add(new LastMonthAction
                        {
                            LMactions = lastMonthActionDto.LMactions,
                            LMAdate = lastMonthActionDto.LMAdate,
                            LMAcomments = lastMonthActionDto.LMAcomments
                        });
                    }
                    else
                    {
                        // Update existing entry
                        existingEntry.LMAdate = lastMonthActionDto.LMAdate;
                        existingEntry.LMAcomments = lastMonthActionDto.LMAcomments;
                    }
                }
            }
            else if (existingMonthlyProgress.LastMonthActions != null)
            {
                existingMonthlyProgress.LastMonthActions.Clear();
            }

            // Update CurrentMonthActions (collection)
            if (request.MonthlyProgress.CurrentMonthActions != null)
            {
                if (existingMonthlyProgress.CurrentMonthActions == null)
                {
                    existingMonthlyProgress.CurrentMonthActions = new List<CurrentMonthAction>();
                }

                // Remove entries not present in the request
                var currentMonthActionsToRemove = existingMonthlyProgress.CurrentMonthActions
                    .Where(existingEntry => !request.MonthlyProgress.CurrentMonthActions.Any(dto => dto.CMactions == existingEntry.CMactions))
                    .ToList();

                foreach (var entryToRemove in currentMonthActionsToRemove)
                {
                    existingMonthlyProgress.CurrentMonthActions.Remove(entryToRemove);
                }

                foreach (var currentMonthActionDto in request.MonthlyProgress.CurrentMonthActions)
                {
                    var existingEntry = existingMonthlyProgress.CurrentMonthActions.FirstOrDefault(e => e.CMactions == currentMonthActionDto.CMactions);

                    if (existingEntry == null)
                    {
                        // Add new entry
                        existingMonthlyProgress.CurrentMonthActions.Add(new CurrentMonthAction
                        {
                            CMactions = currentMonthActionDto.CMactions,
                            CMAdate = currentMonthActionDto.CMAdate,
                            CMAcomments = currentMonthActionDto.CMAcomments,
                            CMApriority = currentMonthActionDto.CMApriority
                        });
                    }
                    else
                    {
                        // Update existing entry
                        existingEntry.CMAdate = currentMonthActionDto.CMAdate;
                        existingEntry.CMAcomments = currentMonthActionDto.CMAcomments;
                        existingEntry.CMApriority = currentMonthActionDto.CMApriority;
                    }
                }
            }
            else if (existingMonthlyProgress.CurrentMonthActions != null)
            {
                existingMonthlyProgress.CurrentMonthActions.Clear();
            }

            // Update BudgetTable
            if (request.MonthlyProgress.BudgetTable != null)
            {
                if (existingMonthlyProgress.BudgetTable == null)
                {
                    existingMonthlyProgress.BudgetTable = new BudgetTable();
                }

                // Update OriginalBudget
                if (request.MonthlyProgress.BudgetTable.OriginalBudget != null)
                {
                    if (existingMonthlyProgress.BudgetTable.OriginalBudget == null)
                    {
                        existingMonthlyProgress.BudgetTable.OriginalBudget = new OriginalBudget();
                    }
                    existingMonthlyProgress.BudgetTable.OriginalBudget.RevenueFee = request.MonthlyProgress.BudgetTable.OriginalBudget.RevenueFee;
                    existingMonthlyProgress.BudgetTable.OriginalBudget.Cost = request.MonthlyProgress.BudgetTable.OriginalBudget.Cost;
                    existingMonthlyProgress.BudgetTable.OriginalBudget.ProfitPercentage = request.MonthlyProgress.BudgetTable.OriginalBudget.ProfitPercentage;
                }
                else if (existingMonthlyProgress.BudgetTable.OriginalBudget != null)
                {
                    existingMonthlyProgress.BudgetTable.OriginalBudget = null;
                }

                // Update CurrentBudgetInMIS
                if (request.MonthlyProgress.BudgetTable.CurrentBudgetInMIS != null)
                {
                    if (existingMonthlyProgress.BudgetTable.CurrentBudgetInMIS == null)
                    {
                        existingMonthlyProgress.BudgetTable.CurrentBudgetInMIS = new CurrentBudgetInMIS();
                    }
                    existingMonthlyProgress.BudgetTable.CurrentBudgetInMIS.RevenueFee = request.MonthlyProgress.BudgetTable.CurrentBudgetInMIS.RevenueFee;
                    existingMonthlyProgress.BudgetTable.CurrentBudgetInMIS.Cost = request.MonthlyProgress.BudgetTable.CurrentBudgetInMIS.Cost;
                    existingMonthlyProgress.BudgetTable.CurrentBudgetInMIS.ProfitPercentage = request.MonthlyProgress.BudgetTable.CurrentBudgetInMIS.ProfitPercentage;
                }
                else if (existingMonthlyProgress.BudgetTable.CurrentBudgetInMIS != null)
                {
                    existingMonthlyProgress.BudgetTable.CurrentBudgetInMIS = null;
                }

                // Update PercentCompleteOnCosts
                if (request.MonthlyProgress.BudgetTable.PercentCompleteOnCosts != null)
                {
                    if (existingMonthlyProgress.BudgetTable.PercentCompleteOnCosts == null)
                    {
                        existingMonthlyProgress.BudgetTable.PercentCompleteOnCosts = new PercentCompleteOnCosts();
                    }
                    existingMonthlyProgress.BudgetTable.PercentCompleteOnCosts.RevenueFee = request.MonthlyProgress.BudgetTable.PercentCompleteOnCosts.RevenueFee;
                    existingMonthlyProgress.BudgetTable.PercentCompleteOnCosts.Cost = request.MonthlyProgress.BudgetTable.PercentCompleteOnCosts.Cost;
                    existingMonthlyProgress.BudgetTable.PercentCompleteOnCosts.ProfitPercentage = request.MonthlyProgress.BudgetTable.PercentCompleteOnCosts.ProfitPercentage;
                }
                else if (existingMonthlyProgress.BudgetTable.PercentCompleteOnCosts != null)
                {
                    existingMonthlyProgress.BudgetTable.PercentCompleteOnCosts = null;
                }
            }
            else if (existingMonthlyProgress.BudgetTable != null)
            {
                existingMonthlyProgress.BudgetTable = null;
            }

            await _monthlyProgressRepository.UpdateAsync(existingMonthlyProgress);

            return true;
        }
    }
}
