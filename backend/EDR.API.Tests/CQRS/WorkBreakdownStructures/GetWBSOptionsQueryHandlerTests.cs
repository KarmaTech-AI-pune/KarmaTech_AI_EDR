using Moq;
using EDR.Application.CQRS.WorkBreakdownStructures.Handlers;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.WorkBreakdownStructures
{
    public class GetWBSOptionsQueryHandlerTests
    {
        private readonly Mock<IWBSOptionRepository> _repositoryMock;
        private readonly GetWBSOptionsQueryHandler _handler;

        public GetWBSOptionsQueryHandlerTests()
        {
            _repositoryMock = new Mock<IWBSOptionRepository>();
            _handler = new GetWBSOptionsQueryHandler(_repositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ReturnsWBSOptionsGroupedByLevel()
        {
            // Arrange
            var wbsOptions = new List<WBSOption>
            {
                new WBSOption { Id = 1, Value = "V1", Label = "L1", Level = 1 },
                new WBSOption { Id = 2, Value = "V2", Label = "L2", Level = 1 },
                new WBSOption { Id = 3, Value = "V3", Label = "L3", Level = 2, ParentId = 1 },
                new WBSOption { Id = 4, Value = "V4", Label = "L4", Level = 2, ParentId = 1 },
                new WBSOption { Id = 5, Value = "V5", Label = "L5", Level = 3, ParentId = 3 },
                new WBSOption { Id = 6, Value = "V6", Label = "L6", Level = 3, ParentId = 3 }
            };

            _repositoryMock.Setup(r => r.GetAllAsync()).ReturnsAsync(wbsOptions);

            var query = new GetWBSOptionsQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Level1.Count);
            Assert.Equal(2, result.Level2.Count);
            Assert.Single(result.Level3); // Grouped by ParentId "3"
            Assert.Equal(2, result.Level3["3"].Count);
            
            // Verify level 1 options
            Assert.Contains(result.Level1, o => o.Id == 1);
            Assert.Contains(result.Level1, o => o.Id == 2);
            
            // Verify level 2 options
            Assert.Contains(result.Level2, o => o.Id == 3);
            Assert.Contains(result.Level2, o => o.Id == 4);
            Assert.All(result.Level2, o => Assert.Equal(1, o.ParentId));
            
            // Verify level 3 options
            Assert.Contains(result.Level3["3"], o => o.Id == 5);
            Assert.Contains(result.Level3["3"], o => o.Id == 6);
            Assert.All(result.Level3["3"], o => Assert.Equal(3, o.ParentId));
        }

        [Fact]
        public async Task Handle_WithFormType_CallsGetByFormTypeAsync()
        {
            // Arrange
            var formType = FormType.ODC;
            _repositoryMock.Setup(r => r.GetByFormTypeAsync(formType)).ReturnsAsync(new List<WBSOption>());

            var query = new GetWBSOptionsQuery { FormType = formType };

            // Act
            await _handler.Handle(query, CancellationToken.None);

            // Assert
            _repositoryMock.Verify(r => r.GetByFormTypeAsync(formType), Times.Once);
        }
    }
}
