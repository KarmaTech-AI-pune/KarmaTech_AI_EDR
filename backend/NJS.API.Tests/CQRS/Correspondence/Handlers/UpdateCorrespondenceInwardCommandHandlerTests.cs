using Moq;
using NJS.Application.CQRS.Correspondence.Commands;
using NJS.Application.CQRS.Correspondence.Handlers;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.CQRS.Correspondence.Handlers
{
    public class UpdateCorrespondenceInwardCommandHandlerTests
    {
        private readonly Mock<ICorrespondenceInwardRepository> _mockRepository;
        private readonly UpdateCorrespondenceInwardCommandHandler _handler;

        public UpdateCorrespondenceInwardCommandHandlerTests()
        {
            _mockRepository = new Mock<ICorrespondenceInwardRepository>();
            _handler = new UpdateCorrespondenceInwardCommandHandler(_mockRepository.Object);
        }

        [Fact]
        public async Task Handle_ValidCommand_ReturnsUpdatedCorrespondenceInwardDto()
        {
            // Arrange
            var command = new UpdateCorrespondenceInwardCommand
            {
                Id = 1,
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001-Updated",
                LetterDate = new DateTime(2024, 1, 10),
                NjsInwardNo = "NJS/IN/2024/001-Updated",
                ReceiptDate = new DateTime(2024, 1, 11),
                From = "Public Health Engineering Department-Updated",
                Subject = "Revised Population Projections for STP Design-Updated",
                AttachmentDetails = "Population_Projection_2045_Updated.pdf",
                ActionTaken = "Forwarded to Design Team for STP Capacity Review-Updated",
                StoragePath = "/documents/inward/2024/001-Updated",
                Remarks = "Urgent review required for capacity enhancement-Updated",
                RepliedDate = new DateTime(2024, 1, 16),
                UpdatedBy = "Test Updater"
            };

            var existingCorrespondenceInward = new CorrespondenceInward
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
            };

            _mockRepository.Setup(r => r.GetByIdAsync(command.Id))
                .ReturnsAsync(existingCorrespondenceInward);

            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<CorrespondenceInward>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<CorrespondenceInwardDto>(result);
            Assert.Equal(command.Id, result.Id);
            Assert.Equal(command.ProjectId, result.ProjectId);
            Assert.Equal(command.IncomingLetterNo, result.IncomingLetterNo);
            Assert.Equal(command.LetterDate, result.LetterDate);
            Assert.Equal(command.NjsInwardNo, result.NjsInwardNo);
            Assert.Equal(command.ReceiptDate, result.ReceiptDate);
            Assert.Equal(command.From, result.From);
            Assert.Equal(command.Subject, result.Subject);
            Assert.Equal(command.AttachmentDetails, result.AttachmentDetails);
            Assert.Equal(command.ActionTaken, result.ActionTaken);
            Assert.Equal(command.StoragePath, result.StoragePath);
            Assert.Equal(command.Remarks, result.Remarks);
            Assert.Equal(command.RepliedDate, result.RepliedDate);
            Assert.Equal(existingCorrespondenceInward.CreatedBy, result.CreatedBy);
            Assert.Equal(existingCorrespondenceInward.CreatedAt, result.CreatedAt);
            Assert.Equal(command.UpdatedBy, result.UpdatedBy);
            Assert.NotNull(result.UpdatedAt);

            _mockRepository.Verify(r => r.UpdateAsync(It.Is<CorrespondenceInward>(ci =>
                ci.Id == command.Id &&
                ci.ProjectId == command.ProjectId &&
                ci.IncomingLetterNo == command.IncomingLetterNo &&
                ci.LetterDate == command.LetterDate &&
                ci.NjsInwardNo == command.NjsInwardNo &&
                ci.ReceiptDate == command.ReceiptDate &&
                ci.From == command.From &&
                ci.Subject == command.Subject &&
                ci.AttachmentDetails == command.AttachmentDetails &&
                ci.ActionTaken == command.ActionTaken &&
                ci.StoragePath == command.StoragePath &&
                ci.Remarks == command.Remarks &&
                ci.RepliedDate == command.RepliedDate &&
                ci.UpdatedBy == command.UpdatedBy &&
                ci.UpdatedAt != null
            )), Times.Once);
        }

        [Fact]
        public async Task Handle_CorrespondenceInwardNotFound_ThrowsException()
        {
            // Arrange
            var command = new UpdateCorrespondenceInwardCommand
            {
                Id = 999, // Non-existent ID
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001-Updated",
                LetterDate = new DateTime(2024, 1, 10),
                NjsInwardNo = "NJS/IN/2024/001-Updated",
                ReceiptDate = new DateTime(2024, 1, 11),
                From = "Public Health Engineering Department-Updated",
                Subject = "Revised Population Projections for STP Design-Updated",
                UpdatedBy = "Test Updater"
            };

            _mockRepository.Setup(r => r.GetByIdAsync(command.Id))
                .ReturnsAsync((CorrespondenceInward)null);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(command, CancellationToken.None));
            Assert.Contains("not found", exception.Message);
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_ThrowsException()
        {
            // Arrange
            var command = new UpdateCorrespondenceInwardCommand
            {
                Id = 1,
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001-Updated",
                LetterDate = new DateTime(2024, 1, 10),
                NjsInwardNo = "NJS/IN/2024/001-Updated",
                ReceiptDate = new DateTime(2024, 1, 11),
                From = "Public Health Engineering Department-Updated",
                Subject = "Revised Population Projections for STP Design-Updated",
                UpdatedBy = "Test Updater"
            };

            var existingCorrespondenceInward = new CorrespondenceInward
            {
                Id = 1,
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = new DateTime(2024, 1, 10),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = new DateTime(2024, 1, 11),
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                CreatedBy = "Test Creator",
                CreatedAt = new DateTime(2024, 1, 11)
            };

            _mockRepository.Setup(r => r.GetByIdAsync(command.Id))
                .ReturnsAsync(existingCorrespondenceInward);

            var expectedException = new Exception("Database error");
            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<CorrespondenceInward>()))
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(command, CancellationToken.None));
            Assert.Same(expectedException, exception);
        }
    }
}
