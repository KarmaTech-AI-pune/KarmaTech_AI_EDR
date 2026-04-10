using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDR.Application.CQRS.Handlers.GoNoGoDecision;
using EDR.Application.CQRS.Commands.GoNoGoDecision;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.Services;
using Microsoft.Extensions.Configuration;

namespace EDR.API.Tests.CQRS.GoNoGoDecision
{
    public class GoNoGoDecisionTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<IUserContext> _mockUserContext;

        public GoNoGoDecisionTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var mockTenantService = new Mock<ICurrentTenantService>();
            mockTenantService.Setup(s => s.TenantId).Returns(1);

            _context = new ProjectManagementContext(options, mockTenantService.Object, Mock.Of<IConfiguration>());
            _mockUserContext = new Mock<IUserContext>();
            _mockUserContext.Setup(c => c.GetCurrentUserId()).Returns("test-user");
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task CreateHeader_Success_CalculatesScoreAndSaves()
        {
            // Arrange
            var handler = new CreateGoNoGoDecisionHeaderHandler(_context, _mockUserContext.Object);
            var command = new CreateGoNoGoDecisionHeaderCommand
            {
                HeaderInfo = new HeaderInfoCommand 
                { 
                    BidType = TypeOfBid.Lumpsum, 
                    Sector = "Sector", 
                    Office = "Office",
                    BdHead = "BD Head",
                    TenderFee = 1000,
                    EmdAmount = 5000
                },
                MetaData = new MetaDataCommand { OpprotunityId = 1 },
                Summary = new SummaryCommand { Status = GoNoGoStatus.Green },
                ScoringCriteria = new ScoringCriteriaCommand
                {
                    MarketingPlan = new ScoringCriteriaCommand.CriteriaItem { Score = 5, ScoringDescriptionId = 1 },
                    Profitability = new ScoringCriteriaCommand.CriteriaItem { Score = 10, ScoringDescriptionId = 2 },
                    ClientRelationship = new ScoringCriteriaCommand.CriteriaItem { Score = 5, ScoringDescriptionId = 3 },
                    ProjectKnowledge = new ScoringCriteriaCommand.CriteriaItem { Score = 5, ScoringDescriptionId = 4 },
                    TechnicalEligibility = new ScoringCriteriaCommand.CriteriaItem { Score = 5, ScoringDescriptionId = 5 },
                    FinancialEligibility = new ScoringCriteriaCommand.CriteriaItem { Score = 5, ScoringDescriptionId = 6 },
                    StaffAvailability = new ScoringCriteriaCommand.CriteriaItem { Score = 5, ScoringDescriptionId = 7 },
                    CompetitionAssessment = new ScoringCriteriaCommand.CriteriaItem { Score = 5, ScoringDescriptionId = 8 },
                    CompetitivePosition = new ScoringCriteriaCommand.CriteriaItem { Score = 5, ScoringDescriptionId = 9 },
                    FutureWorkPotential = new ScoringCriteriaCommand.CriteriaItem { Score = 5, ScoringDescriptionId = 10 },
                    ResourceAvailability = new ScoringCriteriaCommand.CriteriaItem { Score = 5, ScoringDescriptionId = 11 },
                    BidSchedule = new ScoringCriteriaCommand.CriteriaItem { Score = 5, ScoringDescriptionId = 12 }
                }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result > 0);
            var header = _context.GoNoGoDecisionHeaders.First();
            Assert.Equal(65, header.TotalScore); // 5*11 + 10 = 65
            Assert.Equal(12, _context.GoNoGoDecisionTransactions.Count());
        }

        [Fact]
        public async Task CreateTransaction_Success_SavesTransaction()
        {
            // Arrange
            var handler = new CreateGoNoGoDecisionTransactionHandler(_context);
            var command = new CreateGoNoGoDecisionTransactionCommand
            {
                Score = 8,
                Commits = "Test comments",
                GoNoGoDecisionHeaderId = 1,
                ScoringCriteriaId = 1,
                CreatedBy = "test-user"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result > 0);
            var transaction = _context.GoNoGoDecisionTransactions.First();
            Assert.Equal(8, transaction.Score);
            Assert.Equal("Test comments", transaction.Commits);
        }
    }
}
