using Moq;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace NJS.Application.Tests.Repositories.Tests
{
    public class InputRegisterRepositoryMockTests
    {
        private readonly Mock<IInputRegisterRepository> _mockRepository;

        public InputRegisterRepositoryMockTests()
        {
            _mockRepository = new Mock<IInputRegisterRepository>();
        }

        [Fact]
        public async Task GetAllAsync_ReturnsAllInputRegisters()
        {
            // Arrange
            var inputRegisters = new List<InputRegister>
            {
                new InputRegister
                {
                    Id = 1,
                    ProjectId = 1,
                    DataReceived = "Test Data 1",
                    ReceiptDate = DateTime.Now.AddDays(-5),
                    ReceivedFrom = "Test User 1",
                    FilesFormat = "PDF",
                    NoOfFiles = 1,
                    FitForPurpose = true,
                    Check = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    CreatedBy = "Test Creator"
                },
                new InputRegister
                {
                    Id = 2,
                    ProjectId = 1,
                    DataReceived = "Test Data 2",
                    ReceiptDate = DateTime.Now.AddDays(-4),
                    ReceivedFrom = "Test User 2",
                    FilesFormat = "DOCX",
                    NoOfFiles = 2,
                    FitForPurpose = false,
                    Check = false,
                    CreatedAt = DateTime.UtcNow.AddDays(-4),
                    CreatedBy = "Test Creator"
                }
            };

            _mockRepository.Setup(r => r.GetAllAsync())
                .ReturnsAsync(inputRegisters);

            // Act
            var result = await _mockRepository.Object.GetAllAsync();

            // Assert
            var resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            Assert.Equal("Test Data 1", resultList[0].DataReceived);
            Assert.Equal("Test Data 2", resultList[1].DataReceived);
            _mockRepository.Verify(r => r.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task GetByIdAsync_ExistingId_ReturnsInputRegister()
        {
            // Arrange
            var id = 1;
            var inputRegister = new InputRegister
            {
                Id = id,
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Test Creator"
            };

            _mockRepository.Setup(r => r.GetByIdAsync(id))
                .ReturnsAsync(inputRegister);

            // Act
            var result = await _mockRepository.Object.GetByIdAsync(id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(id, result.Id);
            Assert.Equal("Test Data", result.DataReceived);
            _mockRepository.Verify(r => r.GetByIdAsync(id), Times.Once);
        }

        [Fact]
        public async Task GetByIdAsync_NonExistingId_ReturnsNull()
        {
            // Arrange
            var id = 999;

            _mockRepository.Setup(r => r.GetByIdAsync(id))
                .ReturnsAsync((InputRegister)null);

            // Act
            var result = await _mockRepository.Object.GetByIdAsync(id);

            // Assert
            Assert.Null(result);
            _mockRepository.Verify(r => r.GetByIdAsync(id), Times.Once);
        }

        [Fact]
        public async Task GetByProjectIdAsync_ExistingProjectId_ReturnsInputRegisters()
        {
            // Arrange
            var projectId = 1;
            var inputRegisters = new List<InputRegister>
            {
                new InputRegister
                {
                    Id = 1,
                    ProjectId = projectId,
                    DataReceived = "Test Data 1",
                    ReceiptDate = DateTime.Now,
                    ReceivedFrom = "Test User 1",
                    FilesFormat = "PDF",
                    NoOfFiles = 1,
                    FitForPurpose = true,
                    Check = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "Test Creator"
                },
                new InputRegister
                {
                    Id = 2,
                    ProjectId = projectId,
                    DataReceived = "Test Data 2",
                    ReceiptDate = DateTime.Now,
                    ReceivedFrom = "Test User 2",
                    FilesFormat = "DOCX",
                    NoOfFiles = 2,
                    FitForPurpose = false,
                    Check = false,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "Test Creator"
                }
            };

            _mockRepository.Setup(r => r.GetByProjectIdAsync(projectId))
                .ReturnsAsync(inputRegisters);

            // Act
            var result = await _mockRepository.Object.GetByProjectIdAsync(projectId);

            // Assert
            var resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            Assert.All(resultList, ir => Assert.Equal(projectId, ir.ProjectId));
            _mockRepository.Verify(r => r.GetByProjectIdAsync(projectId), Times.Once);
        }

        [Fact]
        public async Task GetByProjectIdAsync_NonExistingProjectId_ReturnsEmptyList()
        {
            // Arrange
            var projectId = 999;

            _mockRepository.Setup(r => r.GetByProjectIdAsync(projectId))
                .ReturnsAsync(new List<InputRegister>());

            // Act
            var result = await _mockRepository.Object.GetByProjectIdAsync(projectId);

            // Assert
            Assert.Empty(result);
            _mockRepository.Verify(r => r.GetByProjectIdAsync(projectId), Times.Once);
        }

        [Fact]
        public async Task AddAsync_ValidInputRegister_ReturnsId()
        {
            // Arrange
            var inputRegister = new InputRegister
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Test Creator"
            };

            var expectedId = 1;

            _mockRepository.Setup(r => r.AddAsync(It.IsAny<InputRegister>()))
                .ReturnsAsync(expectedId);

            // Act
            var result = await _mockRepository.Object.AddAsync(inputRegister);

            // Assert
            Assert.Equal(expectedId, result);
            _mockRepository.Verify(r => r.AddAsync(It.IsAny<InputRegister>()), Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ExistingInputRegister_CallsRepository()
        {
            // Arrange
            var inputRegister = new InputRegister
            {
                Id = 1,
                ProjectId = 1,
                DataReceived = "Updated Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Updated User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "Test Creator",
                UpdatedBy = "Test Updater"
            };

            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<InputRegister>()))
                .Returns(Task.CompletedTask);

            // Act
            await _mockRepository.Object.UpdateAsync(inputRegister);

            // Assert
            _mockRepository.Verify(r => r.UpdateAsync(It.IsAny<InputRegister>()), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_ExistingId_CallsRepository()
        {
            // Arrange
            var id = 1;

            _mockRepository.Setup(r => r.DeleteAsync(id))
                .Returns(Task.CompletedTask);

            // Act
            await _mockRepository.Object.DeleteAsync(id);

            // Assert
            _mockRepository.Verify(r => r.DeleteAsync(id), Times.Once);
        }

        [Fact]
        public async Task ExistsAsync_ExistingId_ReturnsTrue()
        {
            // Arrange
            var id = 1;

            _mockRepository.Setup(r => r.ExistsAsync(id))
                .ReturnsAsync(true);

            // Act
            var result = await _mockRepository.Object.ExistsAsync(id);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(r => r.ExistsAsync(id), Times.Once);
        }

        [Fact]
        public async Task ExistsAsync_NonExistingId_ReturnsFalse()
        {
            // Arrange
            var id = 999;

            _mockRepository.Setup(r => r.ExistsAsync(id))
                .ReturnsAsync(false);

            // Act
            var result = await _mockRepository.Object.ExistsAsync(id);

            // Assert
            Assert.False(result);
            _mockRepository.Verify(r => r.ExistsAsync(id), Times.Once);
        }

        [Fact]
        public async Task ResetIdentitySeedAsync_CallsRepository()
        {
            // Arrange
            _mockRepository.Setup(r => r.ResetIdentitySeedAsync())
                .Returns(Task.CompletedTask);

            // Act
            await _mockRepository.Object.ResetIdentitySeedAsync();

            // Assert
            _mockRepository.Verify(r => r.ResetIdentitySeedAsync(), Times.Once);
        }
    }
}
