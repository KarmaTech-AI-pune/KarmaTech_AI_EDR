using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;

namespace NJS.Repositories.Repositories
{
    public class GoNoGoDecisionRepository : IGoNoGoDecisionRepository
    {
        //private static List<GoNoGoDecision> _decisions = new List<GoNoGoDecision>();
        public static List<GoNoGoDecision> _decisions = new List<GoNoGoDecision>
        {
            // For Project 1 (InProgress)
            new GoNoGoDecision {
                Id = 1,
                ProjectId = 1,
                BidType = "Lumpsum",
                Sector = "Water",
                TenderFee = 5000,
                EMDAmount = 100000,
                SubmissionMode = "Online",
                MarketingPlanScore = 8,
                MarketingPlanComments = "Strong marketing strategy in water sector",
                ClientRelationshipScore = 7,
                ClientRelationshipComments = "Good relationship with municipality",
                ProjectKnowledgeScore = 8,
                ProjectKnowledgeComments = "Extensive experience in water supply projects",
                TechnicalEligibilityScore = 9,
                TechnicalEligibilityComments = "Meets all technical requirements",
                FinancialEligibilityScore = 8,
                FinancialEligibilityComments = "Strong financial position",
                StaffAvailabilityScore = 7,
                StaffAvailabilityComments = "Required staff available",
                CompetitionAssessmentScore = 8,
                CompetitionAssessmentComments = "Limited competition in this sector",
                CompetitivePositionScore = 8,
                CompetitivePositionComments = "Strong market position",
                FutureWorkPotentialScore = 9,
                FutureWorkPotentialComments = "High potential for similar projects",
                ProfitabilityScore = 8,
                ProfitabilityComments = "Good profit margins expected",
                ResourceAvailabilityScore = 7,
                ResourceAvailabilityComments = "Resources can be allocated",
                BidScheduleScore = 8,
                BidScheduleComments = "Timeline is achievable",
                TotalScore = 95,
                Status = GoNoGoStatus.Green,
                DecisionComments = "Project aligns with our expertise",
                CompletedDate = new DateTime(2022, 11, 15),
                CompletedBy = "System",
                CreatedAt = new DateTime(2022, 11, 15),
                CreatedBy = "System"
            },

            // For Project 4 (DecisionPending)
            new GoNoGoDecision {
                Id = 2,
                ProjectId = 4,
                BidType = "EPC",
                Sector = "Smart City",
                TenderFee = 7500,
                EMDAmount = 150000,
                SubmissionMode = "Online",
                MarketingPlanScore = 7,
                MarketingPlanComments = "Developing marketing strategy",
                ClientRelationshipScore = 8,
                ClientRelationshipComments = "Strong relationship with authority",
                ProjectKnowledgeScore = 7,
                ProjectKnowledgeComments = "Good understanding of requirements",
                TechnicalEligibilityScore = 8,
                TechnicalEligibilityComments = "Meets technical criteria",
                FinancialEligibilityScore = 8,
                FinancialEligibilityComments = "Financially capable",
                StaffAvailabilityScore = 6,
                StaffAvailabilityComments = "Some resource allocation needed",
                CompetitionAssessmentScore = 7,
                CompetitionAssessmentComments = "Moderate competition",
                CompetitivePositionScore = 7,
                CompetitivePositionComments = "Good market position",
                FutureWorkPotentialScore = 8,
                FutureWorkPotentialComments = "Potential for future smart city projects",
                ProfitabilityScore = 7,
                ProfitabilityComments = "Acceptable profit margins",
                ResourceAvailabilityScore = 6,
                ResourceAvailabilityComments = "Resource planning required",
                BidScheduleScore = 7,
                BidScheduleComments = "Timeline manageable",
                TotalScore = 86,
                Status = GoNoGoStatus.Amber,
                DecisionComments = "Proceed with careful resource planning",
                CompletedDate = new DateTime(2023, 10, 15),
                CompletedBy = "System",
                CreatedAt = new DateTime(2023, 10, 15),
                CreatedBy = "System"
            },

            // For Project 5 (Cancelled)
            new GoNoGoDecision {
                Id = 3,
                ProjectId = 5,
                BidType = "Design-Build",
                Sector = "Coastal",
                TenderFee = 4500,
                EMDAmount = 90000,
                SubmissionMode = "Online",
                MarketingPlanScore = 5,
                MarketingPlanComments = "Limited market presence in coastal sector",
                ClientRelationshipScore = 6,
                ClientRelationshipComments = "New client relationship",
                ProjectKnowledgeScore = 5,
                ProjectKnowledgeComments = "Limited experience in coastal projects",
                TechnicalEligibilityScore = 6,
                TechnicalEligibilityComments = "Some technical gaps identified",
                FinancialEligibilityScore = 7,
                FinancialEligibilityComments = "Financial requirements met",
                StaffAvailabilityScore = 4,
                StaffAvailabilityComments = "Resource constraints identified",
                CompetitionAssessmentScore = 5,
                CompetitionAssessmentComments = "Strong competition in sector",
                CompetitivePositionScore = 5,
                CompetitivePositionComments = "Limited competitive advantage",
                FutureWorkPotentialScore = 6,
                FutureWorkPotentialComments = "Moderate future potential",
                ProfitabilityScore = 5,
                ProfitabilityComments = "Low profit margins expected",
                ResourceAvailabilityScore = 4,
                ResourceAvailabilityComments = "Significant resource gaps",
                BidScheduleScore = 6,
                BidScheduleComments = "Timeline challenging",
                TotalScore = 64,
                Status = GoNoGoStatus.Red,
                DecisionComments = "Project risks outweigh potential benefits",
                CompletedDate = new DateTime(2023, 5, 15),
                CompletedBy = "System",
                CreatedAt = new DateTime(2023, 5, 15),
                CreatedBy = "System"
            }
            // Additional entries can be added for other non-opportunity projects
        };

        public IEnumerable<GoNoGoDecision> GetAll()
        {
            return _decisions;
        }

        public GoNoGoDecision GetById(int id)
        {
            return _decisions.FirstOrDefault(d => d.Id == id);
        }

        public GoNoGoDecision GetByProjectId(int projectId)
        {
            return _decisions.FirstOrDefault(d => d.ProjectId == projectId);
        }

        public void Add(GoNoGoDecision decision)
        {
            decision.Id = _decisions.Count + 1;
            decision.CreatedAt = DateTime.UtcNow;
            _decisions.Add(decision);
        }

        public void Update(GoNoGoDecision decision)
        {
            var existingDecision = _decisions.FirstOrDefault(d => d.Id == decision.Id);
            if (existingDecision != null)
            {
                var index = _decisions.IndexOf(existingDecision);
                decision.LastModifiedAt = DateTime.UtcNow;
                _decisions[index] = decision;
            }
        }

        public void Delete(int id)
        {
            var decision = _decisions.FirstOrDefault(d => d.Id == id);
            if (decision != null)
            {
                _decisions.Remove(decision);
            }
        }
    }
}
