using Moq;
using EDR.Application.CQRS.MeasurementUnit.Handlers;
using EDR.Application.CQRS.MeasurementUnit.Queries;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Handlers
{
    public class GetMeasurementUnitByIdHandlerTests
    {
        private readonly Mock<IMeasurementUnitRepository> _unitRepositoryMock;
        private readonly GetMeasurementUnitByIdHandler _handler;

        public GetMeasurementUnitByIdHandlerTests()
        {
            _unitRepositoryMock = new Mock<IMeasurementUnitRepository>();
            _handler = new GetMeasurementUnitByIdHandler(_unitRepositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ExistingUnit_ReturnsDto()
        {
            // Arrange
            var unitId = 1;
            var formType = FormType.Manpower;
            var query = new GetMeasurementUnitByIdQuery { Id = unitId, FormType = formType };

            var existingUnit = new MeasurementUnit { Id = unitId, Name = "Unit 1", FormType = formType };

            _unitRepositoryMock.Setup(repo => repo.GetByIdAsync(unitId, formType))
                .ReturnsAsync(existingUnit);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            _unitRepositoryMock.Verify(repo => repo.GetByIdAsync(unitId, formType), Times.Once);

            Assert.NotNull(result);
            Assert.Equal(unitId, result.Id);
            Assert.Equal("Unit 1", result.Name);
            Assert.Equal(formType, result.FormType);
        }

        [Fact]
        public async Task Handle_NonExistingUnit_ReturnsNull()
        {
            // Arrange
            var unitId = 999;
            var formType = FormType.Manpower;
            var query = new GetMeasurementUnitByIdQuery { Id = unitId, FormType = formType };

            _unitRepositoryMock.Setup(repo => repo.GetByIdAsync(unitId, formType))
                .ReturnsAsync((MeasurementUnit)null!);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }
    }
}
