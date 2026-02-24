using Microsoft.EntityFrameworkCore;
using Moq;
using NJS.Application.CQRS.WorkBreakdownStructures.Handlers;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.CQRS.WorkBreakdownStructures
{
    public class GetWBSOptionsQueryHandlerTests
    {
        private readonly Mock<ProjectManagementContext> _contextMock;
        private readonly GetWBSOptionsQueryHandler _handler;

        public GetWBSOptionsQueryHandlerTests()
        {
            _contextMock = new Mock<ProjectManagementContext>(new DbContextOptions<ProjectManagementContext>());
            _handler = new GetWBSOptionsQueryHandler(_contextMock.Object);
        }

        [Fact]
        public async Task Handle_ReturnsWBSOptionsGroupedByLevel()
        {
            // Arrange
            var wbsOptions = new List<WBSOption>
            {
                new WBSOption { Id = 1, Name = "Option 1", Level = 1 },
                new WBSOption { Id = 2, Name = "Option 2", Level = 1 },
                new WBSOption { Id = 3, Name = "Option 3", Level = 2, ParentId = 1 },
                new WBSOption { Id = 4, Name = "Option 4", Level = 2, ParentId = 1 },
                new WBSOption { Id = 5, Name = "Option 5", Level = 3, ParentId = 3 },
                new WBSOption { Id = 6, Name = "Option 6", Level = 3, ParentId = 3 }
            };

            var mockDbSet = MockDbSet(wbsOptions.ToArray());
            _contextMock.Setup(c => c.WBSOptions).Returns(mockDbSet.Object);

            var query = new GetWBSOptionsQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Level1Options.Count);
            Assert.Equal(2, result.Level2Options.Count);
            Assert.Equal(2, result.Level3Options.Count);
            
            // Verify level 1 options
            Assert.Contains(result.Level1Options, o => o.Id == 1);
            Assert.Contains(result.Level1Options, o => o.Id == 2);
            
            // Verify level 2 options
            Assert.Contains(result.Level2Options, o => o.Id == 3);
            Assert.Contains(result.Level2Options, o => o.Id == 4);
            Assert.All(result.Level2Options, o => Assert.Equal(1, o.ParentId));
            
            // Verify level 3 options
            Assert.Contains(result.Level3Options, o => o.Id == 5);
            Assert.Contains(result.Level3Options, o => o.Id == 6);
            Assert.All(result.Level3Options, o => Assert.Equal(3, o.ParentId));
        }

        private static Mock<DbSet<T>> MockDbSet<T>(T[] entities) where T : class
        {
            var mockSet = new Mock<DbSet<T>>();
            mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(entities.AsQueryable().Provider);
            mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(entities.AsQueryable().Expression);
            mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(entities.AsQueryable().ElementType);
            mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(entities.AsQueryable().GetEnumerator());
            
            return mockSet;
        }
    }
}
