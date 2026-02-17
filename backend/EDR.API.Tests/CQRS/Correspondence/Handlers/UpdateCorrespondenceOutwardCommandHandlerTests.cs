using Moq;
using EDR.Application.CQRS.Correspondence.Commands;
using EDR.Application.CQRS.Correspondence.Handlers;
using EDR.Application.DTOs;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Correspondence.Handlers
{
    public class UpdateCorrespondenceOutwardCommandHandlerTests
    {
        private readonly Mock<ICorrespondenceOutwardRepository> _mockRepository;
        private readonly UpdateCorrespondenceOutwardCommandHandler _handler;

        public UpdateCorrespondenceOutwardCommandHandlerTests()
        {
            _mockRepository = new Mock<ICorrespondenceOutwardRepository>();
            _handler = new UpdateCorrespondenceOutwardCommandHandler(_mockRepository.Object);
        }

        [Fact]
        public async Task Handle_ValidCommand_ReturnsUpdatedCorrespondenceOutwardDto()
        {
            // Arrange
            var command = new UpdateCorrespondenceOutwardCommand
            {
                Id = 1,
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001-Updated",
                LetterDate = new DateTime(2024, 1, 15),
                To = "Public Health Engineering Department-Updated",
                Subject = "Response to Population Projections for STP Design-Updated",
                AttachmentDetails = "STP_Design_Review_Updated.pdf",
                ActionTaken = "Sent via email and hard copy-Updated",
                StoragePath = "/documents/outward/2024/001-Updated",
                Remarks = "Urgent review completed-Updated",
                Acknowledgement = "Received on 2024-01-16",
                UpdatedBy = "Test Updater"
            };

            var existingCorrespondenceOutward = new CorrespondenceOutward
            {
                Id = 1,
                ProjectId = 1,
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
            };

            _mockRepository.Setup(r => r.GetByIdAsync(command.Id))
                .ReturnsAsync(existingCorrespondenceOutward);

            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<CorrespondenceOutward>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<CorrespondenceOutwardDto>(result);
            Assert.Equal(command.Id, result.Id);
            Assert.Equal(command.ProjectId, result.ProjectId);
            Assert.Equal(command.LetterNo, result.LetterNo);
            Assert.Equal(command.LetterDate, result.LetterDate);
            Assert.Equal(command.To, result.To);
            Assert.Equal(command.Subject, result.Subject);
            Assert.Equal(command.AttachmentDetails, result.AttachmentDetails);
            Assert.Equal(command.ActionTaken, result.ActionTaken);
            Assert.Equal(command.StoragePath, result.StoragePath);
            Assert.Equal(command.Remarks, result.Remarks);
            Assert.Equal(command.Acknowledgement, result.Acknowledgement);
            Assert.Equal(existingCorrespondenceOutward.CreatedBy, result.CreatedBy);
            Assert.Equal(existingCorrespondenceOutward.CreatedAt, result.CreatedAt);
            Assert.Equal(command.UpdatedBy, result.UpdatedBy);
            Assert.NotNull(result.UpdatedAt);

            _mockRepository.Verify(r => r.UpdateAsync(It.Is<CorrespondenceOutward>(co =>
                co.Id == command.Id &&
                co.ProjectId == command.ProjectId &&
                co.LetterNo == command.LetterNo &&
                co.LetterDate == command.LetterDate &&
                co.To == command.To &&
                co.Subject == command.Subject &&
                co.AttachmentDetails == command.AttachmentDetails &&
                co.ActionTaken == command.ActionTaken &&
                co.StoragePath == command.StoragePath &&
                co.Remarks == command.Remarks &&
                co.Acknowledgement == command.Acknowledgement &&
                co.UpdatedBy == command.UpdatedBy &&
                co.UpdatedAt != null
            )), Times.Once);
        }

        [Fact]
        public async Task Handle_CorrespondenceOutwardNotFound_ThrowsException()
        {
            // Arrange
            var command = new UpdateCorrespondenceOutwardCommand
            {
                Id = 999, // Non-existent ID
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001-Updated",
                LetterDate = new DateTime(2024, 1, 15),
                To = "Public Health Engineering Department-Updated",
                Subject = "Response to Population Projections for STP Design-Updated",
                UpdatedBy = "Test Updater"
            };

            _mockRepository.Setup(r => r.GetByIdAsync(command.Id))
                .ReturnsAsync((CorrespondenceOutward)null);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(command, CancellationToken.None));
            Assert.Contains("not found", exception.Message);
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_ThrowsException()
        {
            // Arrange
            var command = new UpdateCorrespondenceOutwardCommand
            {
                Id = 1,
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001-Updated",
                LetterDate = new DateTime(2024, 1, 15),
                To = "Public Health Engineering Department-Updated",
                Subject = "Response to Population Projections for STP Design-Updated",
                UpdatedBy = "Test Updater"
            };

            var existingCorrespondenceOutward = new CorrespondenceOutward
            {
                Id = 1,
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = new DateTime(2024, 1, 15),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                CreatedBy = "Test Creator",
                CreatedAt = new DateTime(2024, 1, 15)
            };

            _mockRepository.Setup(r => r.GetByIdAsync(command.Id))
                .ReturnsAsync(existingCorrespondenceOutward);

            var expectedException = new Exception("Database error");
            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<CorrespondenceOutward>()))
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(command, CancellationToken.None));
            Assert.Same(expectedException, exception);
        }
    }
}

