using EDR.Application.CQRS.WorkBreakdownStructures.Commands;
using EDR.Application.CQRS.WorkBreakdownStructures.Handlers;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.Services;
using EDR.Repositories.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.WBSVersion
{
    public class WBSVersionHandlersTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ICurrentTenantService> _tenantServiceMock;
        private readonly Mock<IWBSVersionRepository> _wbsVersionRepositoryMock;

        public WBSVersionHandlersTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _tenantServiceMock = new Mock<ICurrentTenantService>();
            _tenantServiceMock.SetupProperty(t => t.TenantId, 1);

            var configMock = new Mock<IConfiguration>();
            _context = new ProjectManagementContext(options, _tenantServiceMock.Object, configMock.Object);

            _wbsVersionRepositoryMock = new Mock<IWBSVersionRepository>();
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task CreateWBSVersionCommandHandler_CreatesVersion()
        {
            // Arrange
            // 1. Setup DB with Project, WBS and Header
            var project = new Project { Id = 10, TenantId = 1, Name = "Test Project" };
            _context.Projects.Add(project);

            var header = new WBSHeader { Id = 1, ProjectId = 10, TenantId = 1, Project = project };
            _context.WBSHeaders.Add(header);

            var wbs = new WorkBreakdownStructure { Id = 1, WBSHeaderId = 1, TenantId = 1, WBSHeader = header };
            _context.WorkBreakdownStructures.Add(wbs);
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<CreateWBSVersionCommandHandler>>();
            var handler = new CreateWBSVersionCommandHandler(_context, _wbsVersionRepositoryMock.Object, loggerMock.Object);
            
            var command = new CreateWBSVersionCommand(10, new List<WBSTaskDto>(), "New Version");

            _wbsVersionRepositoryMock.Setup(x => x.GetNextVersionNumberAsync(10)).ReturnsAsync("2.0");
            _wbsVersionRepositoryMock.Setup(x => x.GetByProjectIdAsync(10)).ReturnsAsync(new List<WBSVersionHistory>());

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal("2.0", result);
            _wbsVersionRepositoryMock.Verify(x => x.CreateVersionAsync(It.IsAny<WBSVersionHistory>()), Times.Once);
        }

        [Fact]
        public async Task ActivateWBSVersionCommandHandler_ActivatesVersion()
        {
            // Arrange
            var loggerMock = new Mock<ILogger<ActivateWBSVersionCommandHandler>>();
            var handler = new ActivateWBSVersionCommandHandler(_wbsVersionRepositoryMock.Object, loggerMock.Object);
            var command = new ActivateWBSVersionCommand(10, "1.0");

            _wbsVersionRepositoryMock.Setup(x => x.ActivateVersionAsync(10, "1.0")).ReturnsAsync(true);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(Unit.Value, result);
        }

        [Fact]
        public async Task DeleteWBSVersionCommandHandler_DeletesVersion()
        {
            // Arrange
            var loggerMock = new Mock<ILogger<DeleteWBSVersionCommandHandler>>();
            var handler = new DeleteWBSVersionCommandHandler(_wbsVersionRepositoryMock.Object, loggerMock.Object);
            var command = new DeleteWBSVersionCommand(10, "1.0");

            _wbsVersionRepositoryMock.Setup(x => x.DeleteVersionAsync(10, "1.0")).ReturnsAsync(true);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(Unit.Value, result);
        }

        [Fact]
        public async Task GetLatestWBSVersionQueryHandler_ReturnsLatest()
        {
            // Arrange
            var version = new WBSVersionHistory { Id = 1, WBSHeaderId = 1, Version = "1.0", IsLatest = true };
            _wbsVersionRepositoryMock.Setup(x => x.GetLatestVersionAsync(10)).ReturnsAsync(version);
            _wbsVersionRepositoryMock.Setup(x => x.GetTaskVersionsAsync(1)).ReturnsAsync(new List<WBSTaskVersionHistory>());
            _wbsVersionRepositoryMock.Setup(x => x.GetWorkflowHistoryAsync(1)).ReturnsAsync(new List<WBSVersionWorkflowHistory>());

            var loggerMock = new Mock<ILogger<GetLatestWBSVersionQueryHandler>>();
            var handler = new GetLatestWBSVersionQueryHandler(_wbsVersionRepositoryMock.Object, loggerMock.Object);
            var query = new GetLatestWBSVersionQuery(10);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("1.0", result.Version);
        }
    }
}
