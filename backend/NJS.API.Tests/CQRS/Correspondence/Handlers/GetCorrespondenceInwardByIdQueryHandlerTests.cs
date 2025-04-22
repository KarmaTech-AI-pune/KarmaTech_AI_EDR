using Moq;
using NJS.Application.CQRS.Correspondence.Handlers;
using NJS.Application.CQRS.Correspondence.Queries;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.CQRS.Correspondence.Handlers
{
    public class GetCorrespondenceInwardByIdQueryHandlerTests
    {
        private readonly Mock<ICorrespondenceInwardRepository> _mockRepository;
        private readonly GetCorrespondenceInwardByIdQueryHandler _handler;

        public GetCorrespondenceInwardByIdQueryHandlerTests()
        {
            _mockRepository = new Mock<ICorrespondenceInwardRepository>();
            _handler = new GetCorrespondenceInwardByIdQueryHandler(_mockRepository.Object);
        }

        [Fact]
        public async Task Handle_ExistingId_ReturnsCorrespondenceInwardDto()
        {
            // Arrange
            var correspondenceInward = new CorrespondenceInward
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
                CreatedAt = new DateTime(2024, 1, 11),
                UpdatedBy = "Test Updater",
                UpdatedAt = new DateTime(2024, 1, 12)
            };

            var query = new GetCorrespondenceInwardByIdQuery { Id = correspondenceInward.Id };

            _mockRepository.Setup(r => r.GetByIdAsync(query.Id))
                .ReturnsAsync(correspondenceInward);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<CorrespondenceInwardDto>(result);
            Assert.Equal(correspondenceInward.Id, result.Id);
            Assert.Equal(correspondenceInward.ProjectId, result.ProjectId);
            Assert.Equal(correspondenceInward.IncomingLetterNo, result.IncomingLetterNo);
            Assert.Equal(correspondenceInward.LetterDate, result.LetterDate);
            Assert.Equal(correspondenceInward.NjsInwardNo, result.NjsInwardNo);
            Assert.Equal(correspondenceInward.ReceiptDate, result.ReceiptDate);
            Assert.Equal(correspondenceInward.From, result.From);
            Assert.Equal(correspondenceInward.Subject, result.Subject);
            Assert.Equal(correspondenceInward.AttachmentDetails, result.AttachmentDetails);
            Assert.Equal(correspondenceInward.ActionTaken, result.ActionTaken);
            Assert.Equal(correspondenceInward.StoragePath, result.StoragePath);
            Assert.Equal(correspondenceInward.Remarks, result.Remarks);
            Assert.Equal(correspondenceInward.RepliedDate, result.RepliedDate);
            Assert.Equal(correspondenceInward.CreatedBy, result.CreatedBy);
            Assert.Equal(correspondenceInward.CreatedAt, result.CreatedAt);
            Assert.Equal(correspondenceInward.UpdatedBy, result.UpdatedBy);
            Assert.Equal(correspondenceInward.UpdatedAt, result.UpdatedAt);
        }

        [Fact]
        public async Task Handle_NonExistingId_ReturnsNull()
        {
            // Arrange
            var query = new GetCorrespondenceInwardByIdQuery { Id = 999 }; // Non-existent ID

            _mockRepository.Setup(r => r.GetByIdAsync(query.Id))
                .ReturnsAsync((CorrespondenceInward)null);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_ThrowsException()
        {
            // Arrange
            var query = new GetCorrespondenceInwardByIdQuery { Id = 1 };

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
