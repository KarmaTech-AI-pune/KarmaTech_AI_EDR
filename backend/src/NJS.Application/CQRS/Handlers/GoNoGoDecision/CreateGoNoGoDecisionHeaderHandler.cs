using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using MediatR;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Application.Services.IContract;
using NJS.Application.CQRS.Commands.GoNoGoDecision;
using NJS.Application.Helpers;

namespace NJS.Application.CQRS.Handlers.GoNoGoDecision
{

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

            // Calculate capped total score from individual criteria scores
            int rawTotalScore = CalculateRawTotalFromCriteria(request.ScoringCriteria);
            int cappedTotalScore = Math.Min(rawTotalScore, ScoreCalculationHelper.MAX_TOTAL_SCORE);

            var header = new GoNoGoDecisionHeader
            {
                TypeOfBid = request.HeaderInfo.BidType,
                Sector = request.HeaderInfo.Sector,
                Office = request.HeaderInfo.Office,
                BdHead = request.HeaderInfo.BdHead,              
                TenderFee = request.HeaderInfo.TenderFee,
                Emd = request.HeaderInfo.EmdAmount,
                TotalScore = cappedTotalScore, // Use capped score instead of request.Summary.TotalScore
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

        /// <summary>
        /// Calculates the raw total score from individual scoring criteria
        /// </summary>
        /// <param name="criteria">The scoring criteria command containing all individual scores</param>
        /// <returns>Sum of all individual criterion scores</returns>
        private int CalculateRawTotalFromCriteria(ScoringCriteriaCommand criteria)
        {
            return (criteria.MarketingPlan?.Score ?? 0) +
                   (criteria.ClientRelationship?.Score ?? 0) +
                   (criteria.ProjectKnowledge?.Score ?? 0) +
                   (criteria.TechnicalEligibility?.Score ?? 0) +
                   (criteria.FinancialEligibility?.Score ?? 0) +
                   (criteria.StaffAvailability?.Score ?? 0) +
                   (criteria.CompetitionAssessment?.Score ?? 0) +
                   (criteria.CompetitivePosition?.Score ?? 0) +
                   (criteria.FutureWorkPotential?.Score ?? 0) +
                   (criteria.Profitability?.Score ?? 0) +
                   (criteria.ResourceAvailability?.Score ?? 0) +
                   (criteria.BidSchedule?.Score ?? 0);
        }
    }
}
