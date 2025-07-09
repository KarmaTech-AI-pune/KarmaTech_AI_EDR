using MediatR;
using NJS.Application.CQRS.MonthlyProgress.Commands;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
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
            if (request == null)
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

            // Update Month and Year if provided
            if (request.MonthlyProgress?.Month > 0)
            {
                existingMonthlyProgress.Month = request.MonthlyProgress.Month;
            }
            if (request.MonthlyProgress?.Year > 0)
            {
                existingMonthlyProgress.Year = request.MonthlyProgress.Year;
            }

            // Update FinancialDetails
            if (request.MonthlyProgress?.FinancialAndContractDetails != null)
            {
                if (existingMonthlyProgress.FinancialDetails == null)
                {
                    existingMonthlyProgress.FinancialDetails = new FinancialDetails();
                }
                existingMonthlyProgress.FinancialDetails.Net = request.MonthlyProgress.FinancialAndContractDetails.Net;
                existingMonthlyProgress.FinancialDetails.ServiceTax = request.MonthlyProgress.FinancialAndContractDetails.ServiceTax;
                existingMonthlyProgress.FinancialDetails.FeeTotal = request.MonthlyProgress.FinancialAndContractDetails.FeeTotal;
                existingMonthlyProgress.FinancialDetails.BudgetOdcs = request.MonthlyProgress.FinancialAndContractDetails.BudgetOdcs;
                existingMonthlyProgress.FinancialDetails.BudgetStaff = request.MonthlyProgress.FinancialAndContractDetails.BudgetStaff;
                existingMonthlyProgress.FinancialDetails.BudgetSubTotal = request.MonthlyProgress.FinancialAndContractDetails.BudgetSubTotal;
                existingMonthlyProgress.FinancialDetails.ContractType = request.MonthlyProgress.FinancialAndContractDetails.ContractType;
            }
            else if (existingMonthlyProgress.FinancialDetails != null)
            {
                // If DTO has null but entity has existing, remove it (or handle as per business logic)
                existingMonthlyProgress.FinancialDetails = null;
            }

            // Update ContractAndCost (ActualCost)
            if (request.MonthlyProgress?.ActualCost != null)
            {
                if (existingMonthlyProgress.ContractAndCost == null)
                {
                    existingMonthlyProgress.ContractAndCost = new ContractAndCost();
                }
                existingMonthlyProgress.ContractAndCost.PriorCumulativeOdc = request.MonthlyProgress.ActualCost.PriorCumulativeOdc;
                existingMonthlyProgress.ContractAndCost.PriorCumulativeStaff = request.MonthlyProgress.ActualCost.PriorCumulativeStaff;
                existingMonthlyProgress.ContractAndCost.PriorCumulativeTotal = request.MonthlyProgress.ActualCost.PriorCumulativeTotal;
                existingMonthlyProgress.ContractAndCost.ActualOdc = request.MonthlyProgress.ActualCost.ActualOdc;
                existingMonthlyProgress.ContractAndCost.ActualStaff = request.MonthlyProgress.ActualCost.ActualStaff;
                existingMonthlyProgress.ContractAndCost.ActualSubtotal = request.MonthlyProgress.ActualCost.ActualSubtotal;
                existingMonthlyProgress.ContractAndCost.TotalCumulativeOdc = request.MonthlyProgress.ActualCost.TotalCumulativeOdc;
                existingMonthlyProgress.ContractAndCost.TotalCumulativeStaff = request.MonthlyProgress.ActualCost.TotalCumulativeStaff;
                existingMonthlyProgress.ContractAndCost.TotalCumulativeCost = request.MonthlyProgress.ActualCost.TotalCumulativeCost;
            }
            else if (existingMonthlyProgress.ContractAndCost != null)
            {
                existingMonthlyProgress.ContractAndCost = null;
            }

            // Update CTCEAC
            if (request.MonthlyProgress?.CtcAndEac != null)
            {
                if (existingMonthlyProgress.CTCEAC == null)
                {
                    existingMonthlyProgress.CTCEAC = new CTCEAC();
                }
                existingMonthlyProgress.CTCEAC.CtcODC = request.MonthlyProgress.CtcAndEac.CtcODC;
                existingMonthlyProgress.CTCEAC.CtcStaff = request.MonthlyProgress.CtcAndEac.CtcStaff;
                existingMonthlyProgress.CTCEAC.CtcSubtotal = request.MonthlyProgress.CtcAndEac.CtcSubtotal;
                existingMonthlyProgress.CTCEAC.ActualctcODC = request.MonthlyProgress.CtcAndEac.ActualctcODC;
                existingMonthlyProgress.CTCEAC.ActualCtcStaff = request.MonthlyProgress.CtcAndEac.ActualCtcStaff;
                existingMonthlyProgress.CTCEAC.ActualCtcSubtotal = request.MonthlyProgress.CtcAndEac.ActualCtcSubtotal;
                existingMonthlyProgress.CTCEAC.EacOdc = request.MonthlyProgress.CtcAndEac.EacOdc;
                existingMonthlyProgress.CTCEAC.EacStaff = request.MonthlyProgress.CtcAndEac.EacStaff;
                existingMonthlyProgress.CTCEAC.TotalEAC = request.MonthlyProgress.CtcAndEac.TotalEAC;
                existingMonthlyProgress.CTCEAC.GrossProfitPercentage = request.MonthlyProgress.CtcAndEac.GrossProfitPercentage;
            }
            else if (existingMonthlyProgress.CTCEAC != null)
            {
                existingMonthlyProgress.CTCEAC = null;
            }

            // Update Schedule
            if (request.MonthlyProgress?.Schedule != null)
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
            if (request.MonthlyProgress.ManpowerPlanning?.Manpower != null)
            {
                if (existingMonthlyProgress.ManpowerEntries == null)
                {
                    existingMonthlyProgress.ManpowerEntries = new List<ManpowerPlanning>();
                }

                // Remove entries not present in the request
                var manpowerEntriesToRemove = existingMonthlyProgress.ManpowerEntries
                    .Where(existingEntry => !request.MonthlyProgress.ManpowerPlanning.Manpower.Any(dto => dto.WorkAssignment == existingEntry.WorkAssignment))
                    .ToList();

                foreach (var entryToRemove in manpowerEntriesToRemove)
                {
                    existingMonthlyProgress.ManpowerEntries.Remove(entryToRemove);
                }

                foreach (var manpowerDto in request.MonthlyProgress.ManpowerPlanning.Manpower)
                {
                    var existingEntry = existingMonthlyProgress.ManpowerEntries.FirstOrDefault(e => e.WorkAssignment == manpowerDto.WorkAssignment);

                    if (existingEntry == null)
                    {
                        // Add new entry
                        existingMonthlyProgress.ManpowerEntries.Add(new ManpowerPlanning
                        {
                            WorkAssignment = manpowerDto.WorkAssignment,
                            Assignee = manpowerDto.Assignee,
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
                        existingEntry.Assignee = manpowerDto.Assignee;
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
            // Update ManpowerTotal from the ManpowerPlanning
            if (request.MonthlyProgress?.ManpowerPlanning?.ManpowerTotal != null)
            {
                existingMonthlyProgress.ManpowerTotal =
                    request.MonthlyProgress.ManpowerPlanning.ManpowerTotal.PlannedTotal ?? 0;
            }

            // Update ProgressDeliverables (collection)
            if (request.MonthlyProgress?.ProgressDeliverable?.Deliverables != null)
            {
                if (existingMonthlyProgress.ProgressDeliverables == null)
                {
                    existingMonthlyProgress.ProgressDeliverables = new List<ProgressDeliverable>();
                }

                // Remove entries not present in the request
                var deliverablesToRemove = existingMonthlyProgress.ProgressDeliverables
                    .Where(existingEntry => !request.MonthlyProgress.ProgressDeliverable.Deliverables.Any(dto => dto.Milestone == existingEntry.Milestone))
                    .ToList();

                foreach (var entryToRemove in deliverablesToRemove)
                {
                    existingMonthlyProgress.ProgressDeliverables.Remove(entryToRemove);
                }

                foreach (var deliverableDto in request.MonthlyProgress.ProgressDeliverable.Deliverables)
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
            if (request.MonthlyProgress?.ChangeOrder != null)
            {
                if (existingMonthlyProgress.ChangeOrders == null)
                {
                    existingMonthlyProgress.ChangeOrders = new List<ChangeOrder>();
                }

                // Remove entries not present in the request
                var changeOrdersToRemove = existingMonthlyProgress.ChangeOrders
                    .Where(existingEntry => !request.MonthlyProgress.ChangeOrder.Any(dto => dto.SummaryDetails == existingEntry.SummaryDetails))
                    .ToList();

                foreach (var entryToRemove in changeOrdersToRemove)
                {
                    existingMonthlyProgress.ChangeOrders.Remove(entryToRemove);
                }

                foreach (var changeOrderDto in request.MonthlyProgress.ChangeOrder)
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

            // Update ProgrammeSchedules (collection)
            if (request.MonthlyProgress?.ProgrammeSchedule != null)
            {
                if (existingMonthlyProgress.ProgrammeSchedules == null)
                {
                    existingMonthlyProgress.ProgrammeSchedules = new List<ProgrammeSchedule>();
                }

                existingMonthlyProgress.ProgrammeSchedules.Clear();
                foreach (var programmeDto in request.MonthlyProgress.ProgrammeSchedule)
                {
                    existingMonthlyProgress.ProgrammeSchedules.Add(new ProgrammeSchedule
                    {
                        ProgrammeDescription = programmeDto.ProgrammeDescription
                    });
                }
            }
            else if (existingMonthlyProgress.ProgrammeSchedules != null)
            {
                existingMonthlyProgress.ProgrammeSchedules.Clear();
            }

            // Update EarlyWarnings (collection)
            if (request.MonthlyProgress?.EarlyWarnings != null)
            {
                if (existingMonthlyProgress.EarlyWarnings == null)
                {
                    existingMonthlyProgress.EarlyWarnings = new List<EarlyWarning>();
                }

                existingMonthlyProgress.EarlyWarnings.Clear();
                foreach (var warningDto in request.MonthlyProgress.EarlyWarnings)
                {
                    existingMonthlyProgress.EarlyWarnings.Add(new EarlyWarning
                    {
                        WarningsDescription = warningDto.WarningsDescription
                    });
                }
            }
            else if (existingMonthlyProgress.EarlyWarnings != null)
            {
                existingMonthlyProgress.EarlyWarnings.Clear();
            }

            // Update LastMonthActions (collection)
            if (request.MonthlyProgress?.LastMonthActions != null)
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
            if (request.MonthlyProgress?.CurrentMonthActions != null)
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
            if (request.MonthlyProgress?.BudgetTable != null)
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
