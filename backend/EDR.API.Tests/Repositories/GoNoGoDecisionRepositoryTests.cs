using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using EDR.Repositories.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EDR.Domain.Enums;
using Xunit;

namespace EDR.API.Tests.Repositories
{
    public class GoNoGoDecisionRepositoryTests
    {
        private readonly DbContextOptions<ProjectManagementContext> _options;
        private readonly Mock<ICurrentTenantService> _currentTenantServiceMock;
        private readonly Mock<IConfiguration> _configurationMock;

        public GoNoGoDecisionRepositoryTests()
        {
            _options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _currentTenantServiceMock = new Mock<ICurrentTenantService>();
            _currentTenantServiceMock.Setup(s => s.TenantId).Returns(1);
            _configurationMock = new Mock<IConfiguration>();
        }

        private ProjectManagementContext GetContext()
        {
            return new ProjectManagementContext(_options, _currentTenantServiceMock.Object, _configurationMock.Object);
        }

        private GoNoGoDecision CreateValidDecision(int id, int projectId, string bidType = "Lumpsum")
        {
            return new GoNoGoDecision
            {
                Id = id,
                ProjectId = projectId,
                TenantId = 1,
                BidType = bidType,
                Sector = "IT",
                TenderFee = 1000,
                EMDAmount = 5000,
                MarketingPlanScore = 5,
                MarketingPlanComments = "Good",
                ClientRelationshipScore = 5,
                ClientRelationshipComments = "Strong",
                ProjectKnowledgeScore = 5,
                ProjectKnowledgeComments = "Deep",
                TechnicalEligibilityScore = 5,
                TechnicalEligibilityComments = "Eligible",
                FinancialEligibilityScore = 5,
                FinancialEligibilityComments = "Strong",
                StaffAvailabilityScore = 5,
                StaffAvailabilityComments = "Available",
                CompetitionAssessmentScore = 5,
                CompetitionAssessmentComments = "Low",
                CompetitivePositionScore = 5,
                CompetitivePositionComments = "Strong",
                FutureWorkPotentialScore = 5,
                FutureWorkPotentialComments = "High",
                ProfitabilityScore = 5,
                ProfitabilityComments = "Expected",
                ResourceAvailabilityScore = 5,
                ResourceAvailabilityComments = "Ready",
                BidScheduleScore = 5,
                BidScheduleComments = "Tight but feasible",
                TotalScore = 60,
                Status = GoNoGoStatus.Green,
                CompletedDate = DateTime.Now,
                CompletedBy = "System",
                CreatedAt = DateTime.Now,
                CreatedBy = "System"
            };
        }

        [Fact]
        public void GetAll_ShouldReturnAllDecisions()
        {
            // Arrange
            using var context = GetContext();
            var repository = new GoNoGoDecisionRepository(context);
            
            // Add test data
            context.GoNoGoDecisions.AddRange(
                CreateValidDecision(1, 1),
                CreateValidDecision(2, 2),
                CreateValidDecision(3, 3)
            );
            context.SaveChanges();

            // Act
            var decisions = repository.GetAll();

            // Assert
            Assert.Equal(3, decisions.Count());
            Assert.Contains(decisions, d => d.ProjectId == 1);
            Assert.Contains(decisions, d => d.ProjectId == 2);
            Assert.Contains(decisions, d => d.ProjectId == 3);
        }

        [Fact]
        public async Task GetById_WithValidId_ShouldReturnDecision()
        {
            // Arrange
            using var context = GetContext();
            var repository = new GoNoGoDecisionRepository(context);
            
            // Add test data
            var decision = CreateValidDecision(1, 1);
            await context.GoNoGoDecisions.AddAsync(decision);
            await context.SaveChangesAsync();

            // Act
            var result = repository.GetById(decision.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(decision.Id, result.Id);
            Assert.Equal(1, result.ProjectId);
        }

        [Fact]
        public void GetById_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            using var context = GetContext();
            var repository = new GoNoGoDecisionRepository(context);

            // Act
            var result = repository.GetById(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public void Create_ShouldAddDecisionAndReturnVoid()
        {
            // Arrange
            using var context = GetContext();
            var repository = new GoNoGoDecisionRepository(context);
            var decision = CreateValidDecision(1, 10);

            // Act
            repository.Add(decision);

            // Assert
            var savedDecision = context.GoNoGoDecisions.Find(1);
            Assert.NotNull(savedDecision);
            Assert.Equal(10, savedDecision.ProjectId);
        }

        [Fact]
        public void Update_WithValidDecision_ShouldUpdate()
        {
            // Arrange
            using var context = GetContext();
            var repository = new GoNoGoDecisionRepository(context);
            
            // Add test data
            var decision = CreateValidDecision(1, 1, "Original");
            context.GoNoGoDecisions.Add(decision);
            context.SaveChanges();

            // Act
            decision.BidType = "Updated";
            repository.Update(decision);

            // Assert
            var updatedDecision = context.GoNoGoDecisions.Find(decision.Id);
            Assert.NotNull(updatedDecision);
            Assert.Equal("Updated", updatedDecision.BidType);
        }

        [Fact]
        public void Delete_WithValidId_ShouldRemoveDecision()
        {
            // Arrange
            using var context = GetContext();
            var repository = new GoNoGoDecisionRepository(context);
            
            // Add test data
            var decision = CreateValidDecision(1, 1);
            context.GoNoGoDecisions.Add(decision);
            context.SaveChanges();

            // Act
            repository.Delete(decision.Id);

            // Assert
            Assert.Null(context.GoNoGoDecisions.Find(decision.Id));
        }

        [Fact]
        public async Task GetVersions_ShouldReturnVersionsForHeader()
        {
            // Arrange
            using var context = GetContext();
            var repository = new GoNoGoDecisionRepository(context);
            
            // Add test data
            var headerId = 1;
            var versions = new List<GoNoGoVersion>
            {
                new GoNoGoVersion { Id = 1, GoNoGoDecisionHeaderId = headerId, VersionNumber = 1, CreatedAt = DateTime.Now },
                new GoNoGoVersion { Id = 2, GoNoGoDecisionHeaderId = headerId, VersionNumber = 2, CreatedAt = DateTime.Now },
                new GoNoGoVersion { Id = 3, GoNoGoDecisionHeaderId = 2, VersionNumber = 1, CreatedAt = DateTime.Now } // Different header
            };
            
            await context.GoNoGoVersions.AddRangeAsync(versions);
            await context.SaveChangesAsync();

            // Act
            var result = await repository.GetVersions(headerId);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Contains(result, v => v.VersionNumber == 1);
            Assert.Contains(result, v => v.VersionNumber == 2);
        }
    }
}
