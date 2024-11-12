using Microsoft.EntityFrameworkCore;
using NJS.Repositories.Interfaces;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System.Collections.Concurrent;

namespace NJS.Repositories.Repositories
{
    public class OpportunityTrackingRepository : IOpportunityTrackingRepository
    {
        // Use ConcurrentDictionary for thread-safe operations
        private static readonly ConcurrentDictionary<int, OpportunityTracking> _opportunityTrackings;

        static OpportunityTrackingRepository()
        {
            // Initialize with seed data
            var seedData = new List<OpportunityTracking>
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
                    ProbableQualifyingCriteria = "Similar project experience, Local presence",
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

            _opportunityTrackings = new ConcurrentDictionary<int, OpportunityTracking>(
                seedData.ToDictionary(o => o.Id)
            );
        }

        public async Task<OpportunityTracking?> GetByIdAsync(int id)
        {
            _opportunityTrackings.TryGetValue(id, out var opportunity);
            return opportunity;
        }

        public async Task<IEnumerable<OpportunityTracking>> GetAllAsync()
        {
            return _opportunityTrackings.Values;
        }

        public async Task<IEnumerable<OpportunityTracking>> GetByProjectIdAsync(int projectId)
        {
            return _opportunityTrackings.Values.Where(o => o.ProjectId == projectId);
        }

        public async Task<OpportunityTracking> AddAsync(OpportunityTracking opportunityTracking)
        {
            // Validate required fields
            if (string.IsNullOrEmpty(opportunityTracking.Stage))
                throw new ArgumentException("Stage is required");
            if (string.IsNullOrEmpty(opportunityTracking.StrategicRanking))
                throw new ArgumentException("Strategic Ranking is required");
            if (string.IsNullOrEmpty(opportunityTracking.BidManager))
                throw new ArgumentException("Bid Manager is required");
            if (string.IsNullOrEmpty(opportunityTracking.TrackedBy))
                throw new ArgumentException("Tracked By is required");

            // Set default values if not provided
            if (opportunityTracking.Month == 0)
                opportunityTracking.Month = DateTime.UtcNow.Month;
            if (opportunityTracking.Year == 0)
                opportunityTracking.Year = DateTime.UtcNow.Year;

            // Generate new ID
            var newId = _opportunityTrackings.Keys.DefaultIfEmpty(0).Max() + 1;
            opportunityTracking.Id = newId;

            // Ensure it's added to the dictionary
            if (!_opportunityTrackings.TryAdd(newId, opportunityTracking))
            {
                throw new Exception("Failed to add opportunity tracking");
            }

            return opportunityTracking;
        }

        public async Task UpdateAsync(OpportunityTracking opportunityTracking)
        {
            if (!_opportunityTrackings.TryUpdate(
                opportunityTracking.Id,
                opportunityTracking,
                _opportunityTrackings[opportunityTracking.Id]))
            {
                throw new Exception("Failed to update opportunity tracking");
            }
        }

        public async Task DeleteAsync(int id)
        {
            _opportunityTrackings.TryRemove(id, out _);
        }
    }
}
