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
    public class CreateCorrespondenceInwardCommandHandlerTests
    {
        private readonly Mock<ICorrespondenceInwardRepository> _mockRepository;
        private readonly CreateCorrespondenceInwardCommandHandler _handler;

        public CreateCorrespondenceInwardCommandHandlerTests()
        {
            _mockRepository = new Mock<ICorrespondenceInwardRepository>();
            _handler = new CreateCorrespondenceInwardCommandHandler(_mockRepository.Object);
        }

        [Fact]
        public async Task Handle_ValidCommand_ReturnsCorrespondenceInwardDto()
        {
            // Arrange
            var command = new CreateCorrespondenceInwardCommand
            {
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
                CreatedBy = "Test Creator"
            };

            var expectedId = 1;
            _mockRepository.Setup(r => r.AddAsync(It.IsAny<CorrespondenceInward>()))
                .ReturnsAsync(expectedId);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<CorrespondenceInwardDto>(result);
            Assert.Equal(expectedId, result.Id);
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
            Assert.Equal(command.CreatedBy, result.CreatedBy);

            _mockRepository.Verify(r => r.AddAsync(It.Is<CorrespondenceInward>(ci =>
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
                ci.CreatedBy == command.CreatedBy
            )), Times.Once);
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_ThrowsException()
        {
            // Arrange
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = new DateTime(2024, 1, 10),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = new DateTime(2024, 1, 11),
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                CreatedBy = "Test Creator"
            };

            var expectedException = new Exception("Database error");
            _mockRepository.Setup(r => r.AddAsync(It.IsAny<CorrespondenceInward>()))
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(command, CancellationToken.None));
            Assert.Same(expectedException, exception);
        }
    }
}

