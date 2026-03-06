using Moq;
using EDR.Application.CQRS.MeasurementUnit.Handlers;
using EDR.Application.CQRS.MeasurementUnit.Queries;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Handlers
{
    public class GetAllMeasurementUnitsQueryHandlerTests
    {
        private readonly Mock<IMeasurementUnitRepository> _unitRepositoryMock;
        private readonly GetAllMeasurementUnitsQueryHandler _handler;

        public GetAllMeasurementUnitsQueryHandlerTests()
        {
            _unitRepositoryMock = new Mock<IMeasurementUnitRepository>();
            _handler = new GetAllMeasurementUnitsQueryHandler(_unitRepositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_ReturnsMeasurementUnitDtos()
        {
            // Arrange
            var formType = FormType.Manpower;
            var query = new GetAllMeasurementUnitsQuery { FormType = formType };

            var units = new List<MeasurementUnit>
            {
                new MeasurementUnit { Id = 1, Name = "Unit 1", FormType = formType },
                new MeasurementUnit { Id = 2, Name = "Unit 2", FormType = formType }
            };

            _unitRepositoryMock.Setup(repo => repo.GetAllAsync(formType))
                .ReturnsAsync(units);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            _unitRepositoryMock.Verify(repo => repo.GetAllAsync(formType), Times.Once);

            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Equal(1, result.ElementAt(0).Id);
            Assert.Equal("Unit 1", result.ElementAt(0).Name);
        }

        [Fact]
        public async Task Handle_NoUnits_ReturnsEmptyList()
        {
            // Arrange
            var formType = FormType.Manpower;
            var query = new GetAllMeasurementUnitsQuery { FormType = formType };

            _unitRepositoryMock.Setup(repo => repo.GetAllAsync(formType))
                .ReturnsAsync(new List<MeasurementUnit>());

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}
