using Moq;
using NJS.Application.CQRS.Correspondence.Commands;
using NJS.Application.CQRS.Correspondence.Handlers;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.API.Tests.CQRS.Correspondence.Handlers
{
    public class CreateCorrespondenceOutwardCommandHandlerTests
    {
        private readonly Mock<ICorrespondenceOutwardRepository> _mockRepository;
        private readonly CreateCorrespondenceOutwardCommandHandler _handler;

        public CreateCorrespondenceOutwardCommandHandlerTests()
        {
            _mockRepository = new Mock<ICorrespondenceOutwardRepository>();
            _handler = new CreateCorrespondenceOutwardCommandHandler(_mockRepository.Object);
        }

        [Fact]
        public async Task Handle_ValidCommand_ReturnsCorrespondenceOutwardDto()
        {
            // Arrange
            var command = new CreateCorrespondenceOutwardCommand
            {
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
                CreatedBy = "Test Creator"
            };

            var expectedId = 1;
            _mockRepository.Setup(r => r.AddAsync(It.IsAny<CorrespondenceOutward>()))
                .ReturnsAsync(expectedId);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<CorrespondenceOutwardDto>(result);
            Assert.Equal(expectedId, result.Id);
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
            Assert.Equal(command.CreatedBy, result.CreatedBy);

            _mockRepository.Verify(r => r.AddAsync(It.Is<CorrespondenceOutward>(co =>
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
                co.CreatedBy == command.CreatedBy
            )), Times.Once);
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_ThrowsException()
        {
            // Arrange
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = new DateTime(2024, 1, 15),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                CreatedBy = "Test Creator"
            };

            var expectedException = new Exception("Database error");
            _mockRepository.Setup(r => r.AddAsync(It.IsAny<CorrespondenceOutward>()))
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(command, CancellationToken.None));
            Assert.Same(expectedException, exception);
        }
    }
}
