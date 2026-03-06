using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.Programs.Queries;
using EDR.Application.CQRS.Programs.Handlers.Queries;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.API.Tests.CQRS.Programs.Handlers.Queries
{
    public class GetAllProgramsQueryHandlerTests
    {
        private readonly Mock<IProgramRepository> _mockRepo;
        private readonly GetAllProgramsQueryHandler _handler;

        public GetAllProgramsQueryHandlerTests()
        {
            _mockRepo = new Mock<IProgramRepository>();
            _handler = new GetAllProgramsQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ReturnsMappedDtos()
        {
            // Arrange
            var request = new GetAllProgramsQuery();
            var entities = new List<EDR.Domain.Entities.Program> 
            { 
                new EDR.Domain.Entities.Program { Id = 1, TenantId = 1, Name = "Program A" },
                new EDR.Domain.Entities.Program { Id = 2, TenantId = 1, Name = "Program B" }
            };

            _mockRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(entities);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            var resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            Assert.Equal("Program A", resultList[0].Name);
            Assert.Equal("Program B", resultList[1].Name);
            _mockRepo.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
