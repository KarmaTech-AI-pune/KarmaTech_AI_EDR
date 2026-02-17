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
    public class GetCorrespondenceOutwardsByProjectQueryHandlerTests
    {
        private readonly Mock<ICorrespondenceOutwardRepository> _mockRepository;
        private readonly GetCorrespondenceOutwardsByProjectQueryHandler _handler;

        public GetCorrespondenceOutwardsByProjectQueryHandlerTests()
        {
            _mockRepository = new Mock<ICorrespondenceOutwardRepository>();
            _handler = new GetCorrespondenceOutwardsByProjectQueryHandler(_mockRepository.Object);
        }

        [Fact]
        public async Task Handle_ExistingProject_ReturnsCorrespondenceOutwardsForProject()
        {
            // Arrange
            var projectId = 1;
            var correspondenceOutwards = new List<CorrespondenceOutward>
            {
                new CorrespondenceOutward
                {
                    Id = 1,
                    ProjectId = projectId,
                    LetterNo = "NJS/OUT/2024/001",
                    LetterDate = new DateTime(2024, 1, 15),
                    To = "Public Health Engineering Department",
                    Subject = "Response to Population Projections for STP Design",
                    AttachmentDetails = "STP_Design_Review.pdf",
                    ActionTaken = "Sent via email and hard copy",
                    StoragePath = "/documents/outward/2024/001",
                    Remarks = "Urgent review completed",
                    Acknowledgement = "Received on 2024-01-15",
                    CreatedBy = "Test Creator",
                    CreatedAt = new DateTime(2024, 1, 15)
                },
                new CorrespondenceOutward
                {
                    Id = 2,
                    ProjectId = projectId,
                    LetterNo = "NJS/OUT/2024/002",
                    LetterDate = new DateTime(2024, 1, 24),
                    To = "Public Health Engineering Department",
                    Subject = "Advanced Oxidation Process Integration Plan",
                    AttachmentDetails = "AOP_Integration_Plan.pdf",
                    ActionTaken = "Sent via email and hard copy",
                    StoragePath = "/documents/outward/2024/002",
                    Remarks = "Awaiting technical approval",
                    Acknowledgement = "Received on 2024-01-24",
                    CreatedBy = "Test Creator",
                    CreatedAt = new DateTime(2024, 1, 24)
                }
            };

            var query = new GetCorrespondenceOutwardsByProjectQuery { ProjectId = projectId };

            _mockRepository.Setup(r => r.GetByProjectIdAsync(projectId))
                .ReturnsAsync(correspondenceOutwards);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.IsAssignableFrom<IEnumerable<CorrespondenceOutwardDto>>(result);
            Assert.Equal(correspondenceOutwards.Count, result.Count());

            // Verify all items have the correct project ID
            foreach (var item in result)
            {
                Assert.Equal(projectId, item.ProjectId);
            }

            // Verify first item
            var firstItem = result.First();
            var expectedFirstItem = correspondenceOutwards.First();
            Assert.Equal(expectedFirstItem.Id, firstItem.Id);
            Assert.Equal(expectedFirstItem.LetterNo, firstItem.LetterNo);
            Assert.Equal(expectedFirstItem.LetterDate, firstItem.LetterDate);
            Assert.Equal(expectedFirstItem.To, firstItem.To);
            Assert.Equal(expectedFirstItem.Subject, firstItem.Subject);
            Assert.Equal(expectedFirstItem.AttachmentDetails, firstItem.AttachmentDetails);
            Assert.Equal(expectedFirstItem.ActionTaken, firstItem.ActionTaken);
            Assert.Equal(expectedFirstItem.StoragePath, firstItem.StoragePath);
            Assert.Equal(expectedFirstItem.Remarks, firstItem.Remarks);
            Assert.Equal(expectedFirstItem.Acknowledgement, firstItem.Acknowledgement);
        }

        [Fact]
        public async Task Handle_NonExistingProject_ReturnsEmptyList()
        {
            // Arrange
            var projectId = 999; // Non-existent project ID
            var query = new GetCorrespondenceOutwardsByProjectQuery { ProjectId = projectId };

            _mockRepository.Setup(r => r.GetByProjectIdAsync(projectId))
                .ReturnsAsync(new List<CorrespondenceOutward>());

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.IsAssignableFrom<IEnumerable<CorrespondenceOutwardDto>>(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_ThrowsException()
        {
            // Arrange
            var projectId = 1;
            var query = new GetCorrespondenceOutwardsByProjectQuery { ProjectId = projectId };

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

