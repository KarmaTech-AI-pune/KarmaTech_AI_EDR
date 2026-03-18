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
    public class DeleteMeasurementUnitHandlerTests
    {
        private readonly Mock<IMeasurementUnitRepository> _unitRepositoryMock;
        private readonly DeleteMeasurementUnitHandler _handler;

        public DeleteMeasurementUnitHandlerTests()
        {
            _unitRepositoryMock = new Mock<IMeasurementUnitRepository>();
            _handler = new DeleteMeasurementUnitHandler(_unitRepositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_RemovesMeasurementUnit()
        {
            // Arrange
            var unitId = 1;
            var formType = FormType.Manpower;
            var command = new DeleteMeasurementUnitCommand { Id = unitId, FormType = formType };

            // Act
            await _handler.Handle(command, CancellationToken.None);

            // Assert
            _unitRepositoryMock.Verify(repo => repo.DeleteAsync(unitId, formType), Times.Once);
        }
    }
}
