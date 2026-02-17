using Moq;
using EDR.Application.CQRS.Correspondence.Handlers;
using EDR.Application.CQRS.Correspondence.Queries;
using EDR.Application.DTOs;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Correspondence.Handlers
{
    public class GetCorrespondenceInwardsByProjectQueryHandlerTests
    {
        private readonly Mock<ICorrespondenceInwardRepository> _mockRepository;
        private readonly GetCorrespondenceInwardsByProjectQueryHandler _handler;

        public GetCorrespondenceInwardsByProjectQueryHandlerTests()
        {
            _mockRepository = new Mock<ICorrespondenceInwardRepository>();
            _handler = new GetCorrespondenceInwardsByProjectQueryHandler(_mockRepository.Object);
        }

        [Fact]
        public async Task Handle_ExistingProject_ReturnsCorrespondenceInwardsForProject()
        {
            // Arrange
            var projectId = 1;
            var correspondenceInwards = new List<CorrespondenceInward>
            {
                new CorrespondenceInward
                {
                    Id = 1,
                    ProjectId = projectId,
                    IncomingLetterNo = "PHED/2024/001",
                    LetterDate = new DateTime(2024, 1, 10),
                    NjsInwardNo = "NJS/IN/2024/001",
                    ReceiptDate = new DateTime(2024, 1, 11),
                    From = "Public Health Engineering Department",
                    Subject = "Revised Population Projections for STP Design",
                    AttachmentDetails = "Population_Projection_2045.pdf",
                    ActionTaken = "Forwarded to Design Team for STP Capacity Review",
                    StoragePath = "/documents/inward/2024/001",
                    Remarks = "Urgent review required for capacity enhancement",
                    RepliedDate = new DateTime(2024, 1, 15),
                    CreatedBy = "Test Creator",
                    CreatedAt = new DateTime(2024, 1, 11)
                },
                new CorrespondenceInward
                {
                    Id = 2,
                    ProjectId = projectId,
                    IncomingLetterNo = "PHED/2024/002",
                    LetterDate = new DateTime(2024, 1, 20),
                    NjsInwardNo = "NJS/IN/2024/002",
                    ReceiptDate = new DateTime(2024, 1, 21),
                    From = "Public Health Engineering Department",
                    Subject = "Water Quality Parameters Update",
                    AttachmentDetails = "WaterQuality_Standards_2024.pdf",
                    ActionTaken = "Reviewed by Process Design Team",
                    StoragePath = "/documents/inward/2024/002",
                    Remarks = "New parameters as per latest CPCB guidelines",
                    RepliedDate = new DateTime(2024, 1, 23),
                    CreatedBy = "Test Creator",
                    CreatedAt = new DateTime(2024, 1, 21)
                }
            };

            var query = new GetCorrespondenceInwardsByProjectQuery { ProjectId = projectId };

            _mockRepository.Setup(r => r.GetByProjectIdAsync(projectId))
                .ReturnsAsync(correspondenceInwards);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.IsAssignableFrom<IEnumerable<CorrespondenceInwardDto>>(result);
            Assert.Equal(correspondenceInwards.Count, result.Count());

            // Verify all items have the correct project ID
            foreach (var item in result)
            {
                Assert.Equal(projectId, item.ProjectId);
            }

            // Verify first item
            var firstItem = result.First();
            var expectedFirstItem = correspondenceInwards.First();
            Assert.Equal(expectedFirstItem.Id, firstItem.Id);
            Assert.Equal(expectedFirstItem.IncomingLetterNo, firstItem.IncomingLetterNo);
            Assert.Equal(expectedFirstItem.LetterDate, firstItem.LetterDate);
            Assert.Equal(expectedFirstItem.NjsInwardNo, firstItem.NjsInwardNo);
            Assert.Equal(expectedFirstItem.ReceiptDate, firstItem.ReceiptDate);
            Assert.Equal(expectedFirstItem.From, firstItem.From);
            Assert.Equal(expectedFirstItem.Subject, firstItem.Subject);
        }

        [Fact]
        public async Task Handle_NonExistingProject_ReturnsEmptyList()
        {
            // Arrange
            var projectId = 999; // Non-existent project ID
            var query = new GetCorrespondenceInwardsByProjectQuery { ProjectId = projectId };

            _mockRepository.Setup(r => r.GetByProjectIdAsync(projectId))
                .ReturnsAsync(new List<CorrespondenceInward>());

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.IsAssignableFrom<IEnumerable<CorrespondenceInwardDto>>(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_ThrowsException()
        {
            // Arrange
            var projectId = 1;
            var query = new GetCorrespondenceInwardsByProjectQuery { ProjectId = projectId };

            var expectedException = new Exception("Database error");
            _mockRepository.Setup(r => r.GetByProjectIdAsync(projectId))
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(query, CancellationToken.None));
            Assert.Same(expectedException, exception);
        }
    }
}

