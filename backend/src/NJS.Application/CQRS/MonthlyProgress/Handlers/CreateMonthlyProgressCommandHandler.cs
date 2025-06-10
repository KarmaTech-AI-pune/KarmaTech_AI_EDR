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
                    ContractType = request.MonthlyProgress.ContractAndCost.ContractType,
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
                ManpowerEntries = request.MonthlyProgress.ManpowerEntries != null ?
                    request.MonthlyProgress.ManpowerEntries.Select(mp => new ManpowerPlanning
                    {
                        WorkAssignment = mp.WorkAssignment,
                        Assignee = mp.AssigneesJson,
                        Planned = mp.Planned ?? 0m,
                        Consumed = mp.Consumed ?? 0m,
                        Balance = mp.Balance ?? 0m,
                        NextMonthPlanning = mp.NextMonthPlanning ?? 0m,
                        ManpowerComments = mp.ManpowerComments
                    }).ToList() : new List<ManpowerPlanning>(),
                ProgressDeliverables = request.MonthlyProgress.ProgressDeliverables != null ?
                    request.MonthlyProgress.ProgressDeliverables.Select(pd => new ProgressDeliverable
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
                ChangeOrders = request.MonthlyProgress.ChangeOrders != null ?
                    request.MonthlyProgress.ChangeOrders.Select(co => new ChangeOrder
                    {
                        ContractTotal = co.ContractTotal,
                        Cost = co.Cost,
                        Fee = co.Fee,
                        SummaryDetails = co.SummaryDetails,
                        Status = co.Status
                    }).ToList() : new List<ChangeOrder>(),
                LastMonthActions = request.MonthlyProgress.LastMonthActions != null ?
                    request.MonthlyProgress.LastMonthActions.Select(lma => new LastMonthAction
                    {
                        LMactions = lma.LMactions,
                        LMAdate = lma.LMAdate,
                        LMAcomments = lma.LMAcomments
                    }).ToList() : new List<LastMonthAction>(),
                CurrentMonthActions = request.MonthlyProgress.CurrentMonthActions != null ?
                    request.MonthlyProgress.CurrentMonthActions.Select(cma => new CurrentMonthAction
                    {
                        CMactions = cma.CMactions,
                        CMAdate = cma.CMAdate,
                        CMAcomments = cma.CMAcomments,
                        CMApriority = cma.CMApriority
                    }).ToList() : new List<CurrentMonthAction>()
            };

            await _monthlyProgressRepository.AddAsync(monthlyProgressEntity);

            return monthlyProgressEntity.Id;
        }
    }
}
