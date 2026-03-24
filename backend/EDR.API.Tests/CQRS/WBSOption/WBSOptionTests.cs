using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDR.Application.CQRS.WorkBreakdownStructures.Handlers;
using EDR.Application.CQRS.WorkBreakdownStructures.Commands;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;
using EDR.Application.CQRS.WBSOption.Handler;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using EDR.Repositories.Interfaces;
using EDR.Repositories.Repositories;
using Microsoft.Extensions.Configuration;

namespace EDR.API.Tests.CQRS.WBSOptions
{
    public class WBSOptionTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly IWBSOptionRepository _repo;

        public WBSOptionTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var mockTenantService = new Mock<ICurrentTenantService>();
            mockTenantService.Setup(s => s.TenantId).Returns(1);

            _context = new ProjectManagementContext(options, mockTenantService.Object, Mock.Of<IConfiguration>());
            _repo = new WBSOptionRepository(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Create_Success_AddsOptions()
        {
            // Arrange
            var handler = new CreateWBSOptionCommandHandler(_repo);
            var command = new CreateWBSOptionCommand
            {
                Options = new List<WBSOptionDto>
                {
                    new WBSOptionDto { Label = "L1", Level = 1, Value = "V1", FormType = 1 },
                    new WBSOptionDto { Label = "L2", Level = 2, Value = "V2", FormType = 1 }
                }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal(2, _context.WBSOptions.Count());
            var l2 = _context.WBSOptions.First(o => o.Level == 2);
            var l1 = _context.WBSOptions.First(o => o.Level == 1);
            Assert.Equal(l1.Id, l2.ParentId);
        }

        [Fact]
        public async Task GetOptions_ReturnsGroupedOptions()
        {
            // Arrange
            _context.WBSOptions.AddRange(
                new EDR.Domain.Entities.WBSOption { Id = 1, Level = 1, Label = "L1", Value = "V1", TenantId = 1, FormType = FormType.ODC },
                new EDR.Domain.Entities.WBSOption { Id = 2, Level = 2, Label = "L2", Value = "V2", ParentId = 1, TenantId = 1, FormType = FormType.ODC }
            );
            await _context.SaveChangesAsync();

            var handler = new GetWBSOptionsQueryHandler(_repo);
            var query = new GetWBSOptionsQuery { FormType = FormType.ODC };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Single(result.Level1);
            Assert.Single(result.Level2);
        }

        [Fact]
        public async Task Delete_WithDescendants_DeletesAll()
        {
            // Arrange
            var l1 = new EDR.Domain.Entities.WBSOption { Id = 1, Level = 1, Label = "L1", Value = "V1", TenantId = 1 };
            var l2 = new EDR.Domain.Entities.WBSOption { Id = 2, Level = 2, Label = "L2", Value = "V2", ParentId = 1, TenantId = 1 };
            _context.WBSOptions.AddRange(l1, l2);
            await _context.SaveChangesAsync();

            var handler = new DeleteWBSOptionCommandHandler(_repo, _context); // Handler constructor expects repo and context
            var command = new DeleteWBSOptionCommand { Id = 1 };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            Assert.Empty(_context.WBSOptions);
        }

        [Fact]
        public async Task Delete_InUseByTask_ThrowsException()
        {
            // Arrange
            var l1 = new EDR.Domain.Entities.WBSOption { Id = 1, Level = 1, Label = "L1", Value = "V1", TenantId = 1 };
            _context.WBSOptions.Add(l1);
            _context.WBSTasks.Add(new WBSTask { Id = 1, WBSOptionId = 1, TenantId = 1, Description = "D", CreatedBy = "T", UpdatedBy = "T" });
            await _context.SaveChangesAsync();

            var handler = new DeleteWBSOptionCommandHandler(_repo, _context);
            var command = new DeleteWBSOptionCommand { Id = 1 };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Update_ExistingOption_UpdatesValues()
        {
            // Arrange
            _context.WBSOptions.Add(new EDR.Domain.Entities.WBSOption { Id = 1, Label = "Old", Level = 1, Value = "V1", TenantId = 1 });
            await _context.SaveChangesAsync();

            var handler = new UpdateWBSOptionCommandHandler(_repo);
            var command = new UpdateWBSOptionCommand
            {
                Options = new List<WBSOptionDto>
                {
                    new WBSOptionDto { Id = 1, Label = "New", Level = 1, Value = "V1", FormType = 1 }
                }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal("New", result[0].Label);
            var updated = await _context.WBSOptions.AsNoTracking().FirstOrDefaultAsync(o => o.Id == 1);
            Assert.Equal("New", updated.Label);
        }

        [Fact]
        public async Task GetWBSLevel1OptionsQueryHandler_ReturnsLevel1()
        {
            // Arrange
            _context.WBSOptions.Add(new EDR.Domain.Entities.WBSOption { Id = 1, Level = 1, Label = "L1", Value = "V1", TenantId = 1 });
            _context.WBSOptions.Add(new EDR.Domain.Entities.WBSOption { Id = 2, Level = 2, Label = "L2", Value = "V2", TenantId = 1 });
            await _context.SaveChangesAsync();

            var handler = new GetWBSLevel1OptionsQueryHandler(_repo);
            var query = new GetWBSLevel1OptionsQuery();

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal(1, result[0].Level);
        }

        [Fact]
        public async Task GetWBSLevel2OptionsQueryHandler_ReturnsLevel2ForParent()
        {
            // Arrange
            _context.WBSOptions.Add(new EDR.Domain.Entities.WBSOption { Id = 1, Level = 1, Label = "L1", Value = "V1", TenantId = 1 });
            _context.WBSOptions.Add(new EDR.Domain.Entities.WBSOption { Id = 2, Level = 2, Label = "L2", Value = "V2", ParentId = 1, TenantId = 1 });
            await _context.SaveChangesAsync();

            var handler = new GetWBSLevel2OptionsQueryHandler(_repo);
            var query = new GetWBSLevel2OptionsQuery { Level1Id = 1 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal(2, result[0].Level);
        }

        [Fact]
        public async Task GetWBSLevel3OptionsQueryHandler_ReturnsLevel3ForParent()
        {
            // Arrange
            _context.WBSOptions.Add(new EDR.Domain.Entities.WBSOption { Id = 1, Level = 2, Label = "L2", Value = "V2", TenantId = 1 });
            _context.WBSOptions.Add(new EDR.Domain.Entities.WBSOption { Id = 2, Level = 3, Label = "L3", Value = "V3", ParentId = 1, TenantId = 1 });
            await _context.SaveChangesAsync();

            var handler = new GetWBSLevel3OptionsQueryHandler(_repo);
            var query = new GetWBSLevel3OptionsQuery { Level2Id = 1 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal(3, result[0].Level);
        }
    }
}
