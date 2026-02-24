using Moq;
using EDR.Application.CQRS.Correspondence.Handlers;
using EDR.Application.CQRS.Correspondence.Queries;
using EDR.Application.DTOs;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Correspondence.Handlers
{
    public class GetCorrespondenceOutwardByIdQueryHandlerTests
    {
        private readonly Mock<ICorrespondenceOutwardRepository> _mockRepository;
        private readonly GetCorrespondenceOutwardByIdQueryHandler _handler;

        public GetCorrespondenceOutwardByIdQueryHandlerTests()
        {
            _mockRepository = new Mock<ICorrespondenceOutwardRepository>();
            _handler = new GetCorrespondenceOutwardByIdQueryHandler(_mockRepository.Object);
        }

        [Fact]
        public async Task Handle_ExistingId_ReturnsCorrespondenceOutwardDto()
        {
            // Arrange
            var correspondenceOutward = new CorrespondenceOutward
            {
                Id = 1,
                ProjectId = 1,
                LetterNo = "EDR/OUT/2024/001",
                LetterDate = new DateTime(2024, 1, 15),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                AttachmentDetails = "STP_Design_Review.pdf",
                ActionTaken = "Sent via email and hard copy",
                StoragePath = "/documents/outward/2024/001",
                Remarks = "Urgent review completed",
                Acknowledgement = "Received on 2024-01-15",
                CreatedBy = "Test Creator",
                CreatedAt = new DateTime(2024, 1, 15),
                UpdatedBy = "Test Updater",
                UpdatedAt = new DateTime(2024, 1, 16)
            };

            var query = new GetCorrespondenceOutwardByIdQuery { Id = correspondenceOutward.Id };

            _mockRepository.Setup(r => r.GetByIdAsync(query.Id))
                .ReturnsAsync(correspondenceOutward);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<CorrespondenceOutwardDto>(result);
            Assert.Equal(correspondenceOutward.Id, result.Id);
            Assert.Equal(correspondenceOutward.ProjectId, result.ProjectId);
            Assert.Equal(correspondenceOutward.LetterNo, result.LetterNo);
            Assert.Equal(correspondenceOutward.LetterDate, result.LetterDate);
            Assert.Equal(correspondenceOutward.To, result.To);
            Assert.Equal(correspondenceOutward.Subject, result.Subject);
            Assert.Equal(correspondenceOutward.AttachmentDetails, result.AttachmentDetails);
            Assert.Equal(correspondenceOutward.ActionTaken, result.ActionTaken);
            Assert.Equal(correspondenceOutward.StoragePath, result.StoragePath);
            Assert.Equal(correspondenceOutward.Remarks, result.Remarks);
            Assert.Equal(correspondenceOutward.Acknowledgement, result.Acknowledgement);
            Assert.Equal(correspondenceOutward.CreatedBy, result.CreatedBy);
            Assert.Equal(correspondenceOutward.CreatedAt, result.CreatedAt);
            Assert.Equal(correspondenceOutward.UpdatedBy, result.UpdatedBy);
            Assert.Equal(correspondenceOutward.UpdatedAt, result.UpdatedAt);
        }

        [Fact]
        public async Task Handle_NonExistingId_ReturnsNull()
        {
            // Arrange
            var query = new GetCorrespondenceOutwardByIdQuery { Id = 999 }; // Non-existent ID

            _mockRepository.Setup(r => r.GetByIdAsync(query.Id))
                .ReturnsAsync((CorrespondenceOutward)null);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_ThrowsException()
        {
            // Arrange
            var query = new GetCorrespondenceOutwardByIdQuery { Id = 1 };

            var expectedException = new Exception("Database error");
            _mockRepository.Setup(r => r.GetByIdAsync(query.Id))
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(query, CancellationToken.None));
            Assert.Same(expectedException, exception);
        }
    }
}


