using Moq;
using NJS.Application.CQRS.InputRegister.Handlers;
using NJS.Application.CQRS.InputRegister.Queries;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.CQRS.InputRegister.Handlers
{
    public class GetAllInputRegistersQueryHandlerTests
    {
        private readonly Mock<IInputRegisterRepository> _mockRepository;
        private readonly GetAllInputRegistersQueryHandler _handler;

        public GetAllInputRegistersQueryHandlerTests()
        {
            _mockRepository = new Mock<IInputRegisterRepository>();
            _handler = new GetAllInputRegistersQueryHandler(_mockRepository.Object);
        }

        [Fact]
        public void Constructor_NullRepository_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new GetAllInputRegistersQueryHandler(null));
        }

        [Fact]
        public async Task Handle_ReturnsAllInputRegisters()
        {
            // Arrange
            var inputRegisters = new List<Domain.Entities.InputRegister>
            {
                new Domain.Entities.InputRegister
                {
                    Id = 1,
                    ProjectId = 1,
                    DataReceived = "Data 1",
                    ReceiptDate = new DateTime(2023, 1, 1),
                    ReceivedFrom = "User 1",
                    FilesFormat = "PDF",
                    NoOfFiles = 1,
                    FitForPurpose = true,
                    Check = true,
                    CheckedBy = "Checker 1",
                    CheckedDate = new DateTime(2023, 1, 2),
                    Custodian = "Custodian 1",
                    StoragePath = "/path/1",
                    Remarks = "Remarks 1",
                    CreatedBy = "Creator 1",
                    CreatedAt = new DateTime(2023, 1, 1),
                    UpdatedBy = "Updater 1",
                    UpdatedAt = new DateTime(2023, 1, 3)
                },
                new Domain.Entities.InputRegister
                {
                    Id = 2,
                    ProjectId = 2,
                    DataReceived = "Data 2",
                    ReceiptDate = new DateTime(2023, 2, 1),
                    ReceivedFrom = "User 2",
                    FilesFormat = "DOCX",
                    NoOfFiles = 2,
                    FitForPurpose = false,
                    Check = false,
                    CheckedBy = "Checker 2",
                    CheckedDate = new DateTime(2023, 2, 2),
                    Custodian = "Custodian 2",
                    StoragePath = "/path/2",
                    Remarks = "Remarks 2",
                    CreatedBy = "Creator 2",
                    CreatedAt = new DateTime(2023, 2, 1),
                    UpdatedBy = null,
                    UpdatedAt = null
                }
            };

            _mockRepository.Setup(r => r.GetAllAsync())
                .ReturnsAsync(inputRegisters);

            var query = new GetAllInputRegistersQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            var resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            
            // Verify first input register
            Assert.Equal(1, resultList[0].Id);
            Assert.Equal(1, resultList[0].ProjectId);
            Assert.Equal("Data 1", resultList[0].DataReceived);
            Assert.Equal(new DateTime(2023, 1, 1), resultList[0].ReceiptDate);
            Assert.Equal("User 1", resultList[0].ReceivedFrom);
            Assert.Equal("PDF", resultList[0].FilesFormat);
            Assert.Equal(1, resultList[0].NoOfFiles);
            Assert.True(resultList[0].FitForPurpose);
            Assert.True(resultList[0].Check);
            Assert.Equal("Checker 1", resultList[0].CheckedBy);
            Assert.Equal(new DateTime(2023, 1, 2), resultList[0].CheckedDate);
            Assert.Equal("Custodian 1", resultList[0].Custodian);
            Assert.Equal("/path/1", resultList[0].StoragePath);
            Assert.Equal("Remarks 1", resultList[0].Remarks);
            Assert.Equal("Creator 1", resultList[0].CreatedBy);
            Assert.Equal(new DateTime(2023, 1, 1), resultList[0].CreatedAt);
            Assert.Equal("Updater 1", resultList[0].UpdatedBy);
            Assert.Equal(new DateTime(2023, 1, 3), resultList[0].UpdatedAt);
            
            // Verify second input register
            Assert.Equal(2, resultList[1].Id);
            Assert.Equal(2, resultList[1].ProjectId);
            Assert.Equal("Data 2", resultList[1].DataReceived);
            Assert.Equal(new DateTime(2023, 2, 1), resultList[1].ReceiptDate);
            Assert.Equal("User 2", resultList[1].ReceivedFrom);
            Assert.Equal("DOCX", resultList[1].FilesFormat);
            Assert.Equal(2, resultList[1].NoOfFiles);
            Assert.False(resultList[1].FitForPurpose);
            Assert.False(resultList[1].Check);
            Assert.Equal("Checker 2", resultList[1].CheckedBy);
            Assert.Equal(new DateTime(2023, 2, 2), resultList[1].CheckedDate);
            Assert.Equal("Custodian 2", resultList[1].Custodian);
            Assert.Equal("/path/2", resultList[1].StoragePath);
            Assert.Equal("Remarks 2", resultList[1].Remarks);
            Assert.Equal("Creator 2", resultList[1].CreatedBy);
            Assert.Equal(new DateTime(2023, 2, 1), resultList[1].CreatedAt);
            Assert.Null(resultList[1].UpdatedBy);
            Assert.Null(resultList[1].UpdatedAt);
            
            // Verify repository was called
            _mockRepository.Verify(r => r.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task Handle_EmptyRepository_ReturnsEmptyList()
        {
            // Arrange
            _mockRepository.Setup(r => r.GetAllAsync())
                .ReturnsAsync(new List<Domain.Entities.InputRegister>());

            var query = new GetAllInputRegistersQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
            
            // Verify repository was called
            _mockRepository.Verify(r => r.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_PropagatesException()
        {
            // Arrange
            var expectedException = new Exception("Database error");
            _mockRepository.Setup(r => r.GetAllAsync())
                .ThrowsAsync(expectedException);

            var query = new GetAllInputRegistersQuery();

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(query, CancellationToken.None));
            
            Assert.Same(expectedException, exception);
            
            // Verify repository was called
            _mockRepository.Verify(r => r.GetAllAsync(), Times.Once);
        }
    }
}
