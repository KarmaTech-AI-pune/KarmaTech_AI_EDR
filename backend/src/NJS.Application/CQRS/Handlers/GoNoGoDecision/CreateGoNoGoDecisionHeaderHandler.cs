using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using MediatR;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Application.Services.IContract;

namespace NJS.Application.CQRS.Handlers.GoNoGoDecision
{
    public class ScoringCriteriaCommand
    {
        public class CriteriaItem
        {
            public string Comments { get; set; }
            public int Score { get; set; }
            public int ScoringDescriptionId { get; set; }
        }

        public CriteriaItem MarketingPlan { get; set; }
        public CriteriaItem Profitability { get; set; }
        public CriteriaItem ProjectKnowledge { get; set; }
        public CriteriaItem ResourceAvailability { get; set; }
        public CriteriaItem StaffAvailability { get; set; }
        public CriteriaItem TechnicalEligibility { get; set; }
        public CriteriaItem ClientRelationship { get; set; }
        public CriteriaItem CompetitionAssessment { get; set; }
        public CriteriaItem CompetitivePosition { get; set; }
        public CriteriaItem FutureWorkPotential { get; set; }
        public CriteriaItem BidSchedule { get; set; }
        public CriteriaItem FinancialEligibility { get; set; }
    }

    public class HeaderInfoCommand
    {
        public TypeOfBid BidType { get; set; }
        public string Sector { get; set; }
        public string Office { get; set; }
        public int TenderFee { get; set; }
        public int EmdAmount { get; set; }
        public string BdHead { get; set; }       
    }

    public class MetaDataCommand
    {
        public int OpprotunityId { get; set; }
        public string CompletedDate { get; set; }
        public string CompletedBy { get; set; }
    }

    public class SummaryCommand
    {
        public int TotalScore { get; set; }
        public GoNoGoStatus Status { get; set; }
        public string DecisionComments { get; set; }
        public string ActionPlan { get; set; }
    }

    public class CreateGoNoGoDecisionHeaderCommand : IRequest<int>
    {
        public HeaderInfoCommand HeaderInfo { get; set; }
        public MetaDataCommand MetaData { get; set; }
        public ScoringCriteriaCommand ScoringCriteria { get; set; }
        public SummaryCommand Summary { get; set; }
    }

    public class CreateGoNoGoDecisionHeaderHandler : IRequestHandler<CreateGoNoGoDecisionHeaderCommand, int>
    {
        private readonly ProjectManagementContext _context;
        private readonly IUserContext _userContext;

        public CreateGoNoGoDecisionHeaderHandler(ProjectManagementContext context, IUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<int> Handle(CreateGoNoGoDecisionHeaderCommand request, CancellationToken cancellationToken)
        {
            var dateTime = DateTime.UtcNow;
            var currentUserId = _userContext.GetCurrentUserId();

            var header = new GoNoGoDecisionHeader
            {
                TypeOfBid = request.HeaderInfo.BidType,
                Sector = request.HeaderInfo.Sector,
                Office = request.HeaderInfo.Office,
                BdHead = request.HeaderInfo.BdHead,              
                TenderFee = request.HeaderInfo.TenderFee,
                Emd = request.HeaderInfo.EmdAmount,
                TotalScore = request.Summary.TotalScore,
                Status = request.Summary.Status,
                OpportunityId = request.MetaData.OpprotunityId,
                CreatedAt = dateTime,
                UpdatedAt = dateTime,
                CreatedBy = currentUserId,
                UpdatedBy = currentUserId
              
              
                
            };

            var transactions = new List<GoNoGoDecisionTransaction>();

            // Add all scoring criteria transactions
            transactions.Add(CreateTransaction(request.ScoringCriteria.MarketingPlan, dateTime, currentUserId));
            transactions.Add(CreateTransaction(request.ScoringCriteria.Profitability, dateTime, currentUserId));
            transactions.Add(CreateTransaction(request.ScoringCriteria.ProjectKnowledge, dateTime, currentUserId));
            transactions.Add(CreateTransaction(request.ScoringCriteria.ResourceAvailability, dateTime, currentUserId));
            transactions.Add(CreateTransaction(request.ScoringCriteria.StaffAvailability, dateTime, currentUserId));
            transactions.Add(CreateTransaction(request.ScoringCriteria.TechnicalEligibility, dateTime, currentUserId));
            transactions.Add(CreateTransaction(request.ScoringCriteria.ClientRelationship, dateTime, currentUserId));
            transactions.Add(CreateTransaction(request.ScoringCriteria.CompetitionAssessment, dateTime, currentUserId));
            transactions.Add(CreateTransaction(request.ScoringCriteria.CompetitivePosition, dateTime, currentUserId));
            transactions.Add(CreateTransaction(request.ScoringCriteria.FutureWorkPotential, dateTime, currentUserId));
            transactions.Add(CreateTransaction(request.ScoringCriteria.BidSchedule, dateTime, currentUserId));
            transactions.Add(CreateTransaction(request.ScoringCriteria.FinancialEligibility, dateTime, currentUserId));

            _context.GoNoGoDecisionHeaders.Add(header);
            await _context.SaveChangesAsync(cancellationToken);

            // Set the header ID for all transactions
            foreach (var transaction in transactions)
            {
                transaction.GoNoGoDecisionHeaderId = header.Id;
            }

            _context.GoNoGoDecisionTransactions.AddRange(transactions);
            await _context.SaveChangesAsync(cancellationToken);

            return header.Id;
        }

        private GoNoGoDecisionTransaction CreateTransaction(ScoringCriteriaCommand.CriteriaItem criteria, DateTime dateTime, string userId)
        {
            if (criteria == null) return null;

            return new GoNoGoDecisionTransaction
            {
                Commits = criteria.Comments,
                Score = criteria.Score,
                ScoringCriteriaId = criteria.ScoringDescriptionId,
                CreatedAt = dateTime,
                UpdatedAt = dateTime,
                CreatedBy = userId,
                UpdatedBy = userId
            };
        }
    }
}
