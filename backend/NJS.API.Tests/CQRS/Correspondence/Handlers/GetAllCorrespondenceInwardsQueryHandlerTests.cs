using Moq;
using NJS.Application.CQRS.Correspondence.Handlers;
using NJS.Application.CQRS.Correspondence.Queries;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.CQRS.Correspondence.Handlers
{
    public class GetAllCorrespondenceInwardsQueryHandlerTests
    {
        private readonly Mock<ICorrespondenceInwardRepository> _mockRepository;
        private readonly GetAllCorrespondenceInwardsQueryHandler _handler;

        public GetAllCorrespondenceInwardsQueryHandlerTests()
        {
            _mockRepository = new Mock<ICorrespondenceInwardRepository>();
            _handler = new GetAllCorrespondenceInwardsQueryHandler(_mockRepository.Object);
        }

        [Fact]
        public async Task Handle_ReturnsAllCorrespondenceInwards()
        {
            // Arrange
            var correspondenceInwards = new List<CorrespondenceInward>
            {
                new CorrespondenceInward
                {
                    Id = 1,
                    ProjectId = 1,
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
                    ProjectId = 1,
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

            _mockRepository.Setup(r => r.GetAllAsync())
                .ReturnsAsync(correspondenceInwards);

            // Act
            var result = await _handler.Handle(new GetAllCorrespondenceInwardsQuery(), CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.IsAssignableFrom<IEnumerable<CorrespondenceInwardDto>>(result);
            Assert.Equal(correspondenceInwards.Count, result.Count());

            // Verify first item
            var firstItem = result.First();
            var expectedFirstItem = correspondenceInwards.First();
            Assert.Equal(expectedFirstItem.Id, firstItem.Id);
            Assert.Equal(expectedFirstItem.ProjectId, firstItem.ProjectId);
            Assert.Equal(expectedFirstItem.IncomingLetterNo, firstItem.IncomingLetterNo);
            Assert.Equal(expectedFirstItem.LetterDate, firstItem.LetterDate);
            Assert.Equal(expectedFirstItem.NjsInwardNo, firstItem.NjsInwardNo);
            Assert.Equal(expectedFirstItem.ReceiptDate, firstItem.ReceiptDate);
            Assert.Equal(expectedFirstItem.From, firstItem.From);
            Assert.Equal(expectedFirstItem.Subject, firstItem.Subject);
            Assert.Equal(expectedFirstItem.AttachmentDetails, firstItem.AttachmentDetails);
            Assert.Equal(expectedFirstItem.ActionTaken, firstItem.ActionTaken);
            Assert.Equal(expectedFirstItem.StoragePath, firstItem.StoragePath);
            Assert.Equal(expectedFirstItem.Remarks, firstItem.Remarks);
            Assert.Equal(expectedFirstItem.RepliedDate, firstItem.RepliedDate);
            Assert.Equal(expectedFirstItem.CreatedBy, firstItem.CreatedBy);
            Assert.Equal(expectedFirstItem.CreatedAt, firstItem.CreatedAt);
        }

        [Fact]
        public async Task Handle_EmptyRepository_ReturnsEmptyList()
        {
            // Arrange
            _mockRepository.Setup(r => r.GetAllAsync())
                .ReturnsAsync(new List<CorrespondenceInward>());

            // Act
            var result = await _handler.Handle(new GetAllCorrespondenceInwardsQuery(), CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.IsAssignableFrom<IEnumerable<CorrespondenceInwardDto>>(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_ThrowsException()
        {
            // Arrange
            var expectedException = new Exception("Database error");
            _mockRepository.Setup(r => r.GetAllAsync())
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(new GetAllCorrespondenceInwardsQuery(), CancellationToken.None));
            Assert.Same(expectedException, exception);
        }
    }
}
