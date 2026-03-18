using Moq;
using EDR.Application.CQRS.MeasurementUnit.Commands;
using EDR.Application.CQRS.MeasurementUnit.Handlers;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Handlers
{
    public class CreateMeasurementUnitHandlerTests
    {
        private readonly Mock<IMeasurementUnitRepository> _unitRepositoryMock;
        private readonly CreateMeasurementUnitHandler _handler;

        public CreateMeasurementUnitHandlerTests()
        {
            _unitRepositoryMock = new Mock<IMeasurementUnitRepository>();
            _handler = new CreateMeasurementUnitHandler(_unitRepositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_AddsMeasurementUnitAndReturnsDto()
        {
            // Arrange
            var command = new CreateMeasurementUnitCommand
            {
                Name = "Unit 1",
                FormType = FormType.Manpower
            };

            _unitRepositoryMock.Setup(repo => repo.AddAsync(It.IsAny<MeasurementUnit>(), FormType.Manpower))
                .Callback<MeasurementUnit, FormType>((m, f) => m.Id = 1);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            _unitRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<MeasurementUnit>(), FormType.Manpower), Times.Once);

            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal(command.Name, result.Name);
            Assert.Equal(command.FormType, result.FormType);
        }
    }
}
