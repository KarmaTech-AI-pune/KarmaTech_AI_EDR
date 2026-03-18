using Moq;
using EDR.Application.CQRS.MeasurementUnit.Commands;
using EDR.Application.CQRS.MeasurementUnit.Handlers;
using EDR.Application.DTOs;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Handlers
{
    public class UpdateMeasurementUnitHandlerTests
    {
        private readonly Mock<IMeasurementUnitRepository> _unitRepositoryMock;
        private readonly UpdateMeasurementUnitHandler _handler;

        public UpdateMeasurementUnitHandlerTests()
        {
            _unitRepositoryMock = new Mock<IMeasurementUnitRepository>();
            _handler = new UpdateMeasurementUnitHandler(_unitRepositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ExistingUnit_UpdatesAndReturnsDto()
        {
            // Arrange
            var unitId = 1;
            var formType = FormType.Manpower;
            var command = new UpdateMeasurementUnitCommand 
            { 
                Id = unitId, 
                Name = "Updated Unit", 
                FormType = formType 
            };

            var existingUnit = new MeasurementUnit { Id = unitId, Name = "Old Unit", FormType = formType };

            _unitRepositoryMock.Setup(repo => repo.GetByIdAsync(unitId, formType))
                .ReturnsAsync(existingUnit);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            _unitRepositoryMock.Verify(repo => repo.GetByIdAsync(unitId, formType), Times.Once);
            _unitRepositoryMock.Verify(repo => repo.UpdateAsync(existingUnit, formType), Times.Once);

            Assert.NotNull(result);
            Assert.Equal(unitId, result.Id);
            Assert.Equal("Updated Unit", result.Name);
            Assert.Equal(formType, result.FormType);
        }

        [Fact]
        public async Task Handle_NonExistingUnit_ReturnsNull()
        {
            // Arrange
            var unitId = 999;
            var formType = FormType.Manpower;
            var command = new UpdateMeasurementUnitCommand { Id = unitId, FormType = formType };

            _unitRepositoryMock.Setup(repo => repo.GetByIdAsync(unitId, formType))
                .ReturnsAsync((MeasurementUnit)null!);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            _unitRepositoryMock.Verify(repo => repo.UpdateAsync(It.IsAny<MeasurementUnit>(), It.IsAny<FormType>()), Times.Never);
            Assert.Null(result);
        }
    }
}
