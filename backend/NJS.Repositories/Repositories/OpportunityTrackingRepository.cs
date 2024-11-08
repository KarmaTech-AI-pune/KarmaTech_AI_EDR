using Microsoft.EntityFrameworkCore;
using NJS.Repositories.Interfaces;
using NJS.Domain.Database;
using NJS.Domain.Entities;

namespace NJS.Repositories.Repositories
{
    public class OpportunityTrackingRepository : IOpportunityTrackingRepository
    {
        private static List<OpportunityTracking> _opportunityTrackings = new List<OpportunityTracking>
        {
            new OpportunityTracking {
                Id = 1,
                ProjectId = 2, 
                Stage = "B",
                StrategicRanking = "H",
                BidFees = 75000,
                EMD = 150000,
                FormOfEMD = "Bank Guarantee",
                BidManager = "John Smith",
                ContactPersonAtClient = "Rajesh Kumar",
                DateOfSubmission = new DateTime(2023, 12, 15),
                PercentageChanceOfProjectHappening = 75.5m,
                PercentageChanceOfNJSSuccess = 65.0m,
                LikelyCompetition = "L&T, HCC, Gammon",
                GrossRevenue = 7500000,
                NetNJSRevenue = 6000000,
                FollowUpComments = "Client very interested in smart solutions",
                Notes = "Need to focus on IoT integration",
                ProbableQualifyingCriteria = "ISO 9001, Previous smart city experience",
                Month = 11,
                Year = 2023,
                TrackedBy = "System",
                CreatedAt = new DateTime(2023, 11, 1),
                CreatedBy = "System",
                LastModifiedAt = new DateTime(2023, 11, 15),
                LastModifiedBy = "System"
            },
            new OpportunityTracking {
                Id = 2,
                ProjectId = 3,
                Stage = "A",
                StrategicRanking = "M",
                BidFees = 50000,
                EMD = 100000,
                FormOfEMD = "Bank Draft",
                BidManager = "Sarah Johnson",
                ContactPersonAtClient = "Amit Patel",
                DateOfSubmission = new DateTime(2023, 12, 30),
                PercentageChanceOfProjectHappening = 60.0m,
                PercentageChanceOfNJSSuccess = 55.0m,
                LikelyCompetition = "Tata Projects, SPML Infra",
                GrossRevenue = 3200000,
                NetNJSRevenue = 2500000,
                FollowUpComments = "Technical presentation scheduled",
                Notes = "Focus on flood prediction systems",
                ProbableQualifyingCriteria = "Similar project experience, Local presence",
                Month = 11,
                Year = 2023,
                TrackedBy = "System",
                CreatedAt = new DateTime(2023, 11, 15),
                CreatedBy = "System",
                LastModifiedAt = new DateTime(2023, 11, 20),
                LastModifiedBy = "System"
            },
            new OpportunityTracking {
                Id = 3,
                ProjectId = 13,
                Stage = "B",
                StrategicRanking = "M",
                BidFees = 50000,
                EMD = 100000,
                FormOfEMD = "Bank Draft",
                BidManager = "John Johnson",
                ContactPersonAtClient = "Amita Patel",
                DateOfSubmission = new DateTime(2023, 12, 30),
                PercentageChanceOfProjectHappening = 60.0m,
                PercentageChanceOfNJSSuccess = 55.0m,
                LikelyCompetition = "Tata Projects, SPML Infra",
                GrossRevenue = 3200000,
                NetNJSRevenue = 2500000,
                FollowUpComments = "Technical presentation scheduled",
                Notes = "Focus on flood prediction systems",
                ProbableQualifyingCriteria = "Similar project experience, Local presence",
                Month = 11,
                Year = 2023,
                TrackedBy = "System",
                CreatedAt = new DateTime(2023, 11, 15),
                CreatedBy = "System",
                LastModifiedAt = new DateTime(2023, 11, 20),
                LastModifiedBy = "System"
            },
            new OpportunityTracking {
                Id = 4,
                ProjectId = 15,
                Stage = "A",
                StrategicRanking = "M",
                BidFees = 50000,
                EMD = 100000,
                FormOfEMD = "Bank Draft",
                BidManager = "Sarah Johnson",
                ContactPersonAtClient = "Amit Patel",
                DateOfSubmission = new DateTime(2023, 12, 30),
                PercentageChanceOfProjectHappening = 60.0m,
                PercentageChanceOfNJSSuccess = 55.0m,
                LikelyCompetition = "Tata Projects, SPML Infra, ABC",
                GrossRevenue = 3200000,
                NetNJSRevenue = 2500000,
                FollowUpComments = "Technical presentation scheduled",
                Notes = "Focus on flood prediction systems",
                ProbableQualifyingCriteria = "Similar project experience, Local presence",
                Month = 11,
                Year = 2023,
                TrackedBy = "System",
                CreatedAt = new DateTime(2023, 11, 15),
                CreatedBy = "System",
                LastModifiedAt = new DateTime(2023, 11, 20),
                LastModifiedBy = "System"
            }
        };

        public async Task<OpportunityTracking?> GetByIdAsync(int id)
        {
            return _opportunityTrackings.FirstOrDefault(o => o.Id == id);
        }

        public async Task<IEnumerable<OpportunityTracking>> GetAllAsync()
        {
            return _opportunityTrackings;
        }

        public async Task<IEnumerable<OpportunityTracking>> GetByProjectIdAsync(int projectId)
        {
            return _opportunityTrackings.Where(o => o.ProjectId == projectId);
        }

        public async Task<OpportunityTracking> AddAsync(OpportunityTracking opportunityTracking)
        {
            opportunityTracking.Id = _opportunityTrackings.Max(o => o.Id) + 1;
            _opportunityTrackings.Add(opportunityTracking);
            return opportunityTracking;
        }

        public async Task UpdateAsync(OpportunityTracking opportunityTracking)
        {
            var existing = _opportunityTrackings.FirstOrDefault(o => o.Id == opportunityTracking.Id);
            if (existing != null)
            {
                var index = _opportunityTrackings.IndexOf(existing);
                _opportunityTrackings[index] = opportunityTracking;
            }
        }

        public async Task DeleteAsync(int id)
        {
            var opportunityTracking = _opportunityTrackings.FirstOrDefault(o => o.Id == id);
            if (opportunityTracking != null)
            {
                _opportunityTrackings.Remove(opportunityTracking);
            }
        }
    }
}
