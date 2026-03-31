using Microsoft.AspNetCore.Identity;
using EDR.Application.CQRS.WorkBreakdownStructures.Commands;
using EDR.Application.CQRS.WorkBreakdownStructures.Handlers;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.Services;
using EDR.Domain.UnitWork;
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

namespace EDR.API.Tests.CQRS.WorkBreakdownStructures
{
    public class WorkBreakdownStructureHandlersTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ICurrentTenantService> _tenantServiceMock;
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<IWBSOptionRepository> _wbsOptionRepositoryMock;
        private readonly Mock<IUserContext> _userContextMock;
        private readonly Mock<IProjectHistoryService> _projectHistoryServiceMock;
        private readonly Mock<IWBSVersionRepository> _wbsVersionRepositoryMock;

        public WorkBreakdownStructureHandlersTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _tenantServiceMock = new Mock<ICurrentTenantService>();
            _tenantServiceMock.SetupProperty(t => t.TenantId, 1);

            var configMock = new Mock<IConfiguration>();
            _context = new ProjectManagementContext(options, _tenantServiceMock.Object, configMock.Object);

            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _wbsOptionRepositoryMock = new Mock<IWBSOptionRepository>();
            _userContextMock = new Mock<IUserContext>();
            _projectHistoryServiceMock = new Mock<IProjectHistoryService>();
            _wbsVersionRepositoryMock = new Mock<IWBSVersionRepository>();

            _userContextMock.Setup(x => x.GetCurrentUserId()).Returns("test-user");

            _unitOfWorkMock.Setup(x => x.SaveChangesAsync())
                .Returns(() => _context.SaveChangesAsync());
        }

        [Fact]
        public async Task SetWBSCommandHandler_NewWBS_CreatesHeaderAndTasks()
        {
            // Arrange
            _context.Projects.Add(new Project { Id = 1, Name = "P1", TenantId = 1 });
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<SetWBSCommandHandler>>();
            var handler = new SetWBSCommandHandler(
                _context, 
                _unitOfWorkMock.Object, 
                _projectHistoryServiceMock.Object, 
                _userContextMock.Object, 
                loggerMock.Object, 
                _wbsVersionRepositoryMock.Object, 
                _wbsOptionRepositoryMock.Object);

            var command = new SetWBSCommand(1, new WBSMasterDto
            {
                WbsHeaderId = 0, // 0 indicates a new header should be created
                WorkBreakdownStructures = new List<WBSStructureMasterDto>
                {
                    new WBSStructureMasterDto
                    {
                        Name = "Group 1",
                        Tasks = new List<WBSTaskDto>
                        {
                            new WBSTaskDto { Title = "Task 1", Level = WBSTaskLevel.Level1, DisplayOrder = 1, TaskType = TaskType.Manpower }
                        }
                    }
                }
            });

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.WbsHeaderId > 0);
            Assert.Single(_context.WBSHeaders);
            Assert.Single(_context.WorkBreakdownStructures);
            Assert.Single(_context.WBSTasks);
        }

        [Fact]
        public async Task SetWBSCommandHandler_ExistingWBS_UpdatesHeaderAndIncrementVersion()
        {
            // Arrange
            _context.Projects.Add(new Project { Id = 1, Name = "P1", TenantId = 1 });
            var header = new WBSHeader { Id = 1, ProjectId = 1, Version = "1.0", TenantId = 1, ApprovalStatus = PMWorkflowStatusEnum.Approved, WorkBreakdownStructures = new List<WorkBreakdownStructure>() };
            _context.WBSHeaders.Add(header);
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<SetWBSCommandHandler>>();
            var handler = new SetWBSCommandHandler(
                _context, 
                _unitOfWorkMock.Object, 
                _projectHistoryServiceMock.Object, 
                _userContextMock.Object, 
                loggerMock.Object, 
                _wbsVersionRepositoryMock.Object, 
                _wbsOptionRepositoryMock.Object);

            var command = new SetWBSCommand(1, new WBSMasterDto
            {
                WbsHeaderId = 1,
                WorkBreakdownStructures = new List<WBSStructureMasterDto>()
            });

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.WbsHeaderId);
            
            var updatedHeader = _context.WBSHeaders.Find(1);
            Assert.Equal("2.0", updatedHeader.Version);
            Assert.Equal(PMWorkflowStatusEnum.Initial, updatedHeader.ApprovalStatus);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task AddWBSTaskCommandHandler_CreatesNewWBSAndTask()
        {
            // Arrange
            var loggerMock = new Mock<ILogger<AddWBSTaskCommandHandler>>();
            var handler = new AddWBSTaskCommandHandler(
                _context,
                _unitOfWorkMock.Object,
                loggerMock.Object,
                _wbsOptionRepositoryMock.Object,
                _userContextMock.Object);

            var command = new AddWBSTaskCommand(1, new WBSMasterDto
            {
                WbsHeaderId = 0,
                WorkBreakdownStructures = new List<WBSStructureMasterDto>
                {
                    new WBSStructureMasterDto
                    {
                        Name = "Phase 1",
                        Tasks = new List<WBSTaskDto>
                        {
                            new WBSTaskDto
                            {
                                Title = "Task 1",
                                WBSOptionId = 1,
                                Level = WBSTaskLevel.Level1,
                                DisplayOrder = 1
                            }
                        }
                    }
                }
            });

            _wbsOptionRepositoryMock.Setup(x => x.GetByIdAsync(1))
                .ReturnsAsync(new WBSOption { Id = 1, Label = "Option 1" });

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.True(_context.WBSHeaders.Any(h => h.ProjectId == 1));
            Assert.True(_context.WBSTasks.Any(t => t.Title == "Task 1"));
        }

        [Fact]
        public async Task UpdateWBSTaskCommandHandler_UpdatesTask()
        {
            // Arrange
            var mediatorMock = new Mock<IMediator>();
            var loggerMock = new Mock<ILogger<UpdateWBSTaskCommandHandler>>();
            var handler = new UpdateWBSTaskCommandHandler(mediatorMock.Object, loggerMock.Object, _wbsOptionRepositoryMock.Object);
            
            var command = new UpdateWBSTaskCommand(1, new WBSMasterDto { WbsHeaderId = 1 });

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            mediatorMock.Verify(x => x.Send(It.IsAny<SetWBSCommand>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task DeleteWBSTaskCommandHandler_DeletesTaskAndChildren()
        {
            // Arrange
            var header = new WBSHeader { Id = 1, ProjectId = 1, TenantId = 1 };
            var wbs = new WorkBreakdownStructure { Id = 1, WBSHeaderId = 1, TenantId = 1 };
            var task = new WBSTask 
            { 
                Id = 1, 
                WorkBreakdownStructureId = 1,
                TenantId = 1,
                IsDeleted = false 
            };
            
            _context.WBSHeaders.Add(header);
            _context.WorkBreakdownStructures.Add(wbs);
            _context.WBSTasks.Add(task);
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<DeleteWBSTaskCommandHandler>>();
            var handler = new DeleteWBSTaskCommandHandler(_context, _unitOfWorkMock.Object, loggerMock.Object);
            var command = new DeleteWBSTaskCommand(1, 1);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            var deletedTask = await _context.WBSTasks.FindAsync(1);
            Assert.Null(deletedTask);
        }

        [Fact]
        public async Task GetWBSByProjectIdQueryHandler_ReturnsWBS()
        {
            // Arrange
            _context.Projects.Add(new Project { Id = 1, Name = "P1", TenantId = 1 });
            var header = new WBSHeader { Id = 1, ProjectId = 1, TenantId = 1, IsActive = true };
            _context.WBSHeaders.Add(header);
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<GetWBSByProjectIdQueryHandler>>();
            var handler = new GetWBSByProjectIdQueryHandler(_context, loggerMock.Object);
            var query = new GetWBSByProjectIdQuery(1);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.WbsHeaderId);
        }

        [Fact]
        public async Task GetApprovedWBSQueryHandler_ReturnsApprovedWBS()
        {
            // Arrange
            var wbsTaskRepositoryMock = new Mock<IWBSTaskRepository>();
            var approvedWBS = new List<WorkBreakdownStructure>
            {
                new WorkBreakdownStructure { Id = 1, WBSHeader = new WBSHeader { ProjectId = 1 }, Tasks = new List<WBSTask>() }
            };
            wbsTaskRepositoryMock.Setup(x => x.GetApprovedWBSAsync(1)).ReturnsAsync(approvedWBS);

            var loggerMock = new Mock<ILogger<GetApprovedWBSQueryHandler>>();
            var handler = new GetApprovedWBSQueryHandler(wbsTaskRepositoryMock.Object, loggerMock.Object);
            var query = new GetApprovedWBSQuery { ProjectId = 1 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal(1, result[0].Id);
        }

        [Fact]
        public async Task GetWBSTasksQueryHandler_ReturnsTasks()
        {
            // Arrange
            var header = new WBSHeader { Id = 1, ProjectId = 1, TenantId = 1, IsActive = true };
            var wbs = new WorkBreakdownStructure { Id = 1, WBSHeaderId = 1, TenantId = 1, WBSHeader = header };
            var task = new WBSTask 
            { 
                Id = 1, 
                WorkBreakdownStructureId = 1, 
                TenantId = 1, 
                Level = WBSTaskLevel.Level1,
                WorkBreakdownStructure = wbs,
                Title = "T1"
            };
            
            _context.WBSHeaders.Add(header);
            _context.WorkBreakdownStructures.Add(wbs);
            _context.WBSTasks.Add(task);
            await _context.SaveChangesAsync();

            var handler = new GetWBSTasksQueryHandler(_context);
            var query = new GetWBSTasksQuery(1);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal("T1", result[0].Title);
        }

        [Fact]
        public async Task GetLevelThreeWbsTasksByProjectIdQueryHandler_ReturnsLevel3Tasks()
        {
            // Arrange
            var header = new WBSHeader { Id = 1, ProjectId = 1, TenantId = 1, IsActive = true };
            var wbs = new WorkBreakdownStructure { Id = 1, WBSHeaderId = 1, TenantId = 1, WBSHeader = header };
            var task = new WBSTask 
            { 
                Id = 1, 
                WorkBreakdownStructureId = 1, 
                TenantId = 1, 
                Level = WBSTaskLevel.Level3,
                WorkBreakdownStructure = wbs,
                Title = "T3"
            };
            
            _context.WBSHeaders.Add(header);
            _context.WorkBreakdownStructures.Add(wbs);
            _context.WBSTasks.Add(task);
            await _context.SaveChangesAsync();

            var handler = new GetLevelThreeWbsTasksByProjectIdQueryHandler(_context);
            var query = new GetLevelThreeWbsTasksByProjectIdQuery(1);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal("T3", result[0].Title);
        }

        private Mock<UserManager<User>> GetUserManagerMock()
        {
            var store = new Mock<IUserStore<User>>();
            return new Mock<UserManager<User>>(store.Object, null, null, null, null, null, null, null, null);
        }

        [Fact]
        public async Task GetManpowerResourcesWithPlannedHoursQueryHandler_ReturnsResources()
        {
            // Arrange
            _context.Projects.Add(new Project { Id = 1, TenantId = 1 });
            var header = new WBSHeader { Id = 1, ProjectId = 1, TenantId = 1, IsActive = true };
            var wbs = new WorkBreakdownStructure { Id = 1, WBSHeaderId = 1, TenantId = 1, WBSHeader = header };
            var task = new WBSTask 
            { 
                Id = 1, 
                WorkBreakdownStructureId = 1, 
                TenantId = 1, 
                TaskType = TaskType.Manpower,
                WorkBreakdownStructure = wbs,
                Title = "Manpower Task"
            };
            _context.WBSHeaders.Add(header);
            _context.WorkBreakdownStructures.Add(wbs);
            _context.WBSTasks.Add(task);
            await _context.SaveChangesAsync();

            var userManagerMock = GetUserManagerMock();
            var loggerMock = new Mock<ILogger<GetManpowerResourcesWithPlannedHoursQueryHandler>>();
            var handler = new GetManpowerResourcesWithPlannedHoursQueryHandler(_context, userManagerMock.Object, loggerMock.Object);
            var query = new GetManpowerResourcesWithPlannedHoursQuery(1);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.ProjectId);
        }

        [Fact]
        public async Task GetWBSResourceDataQueryHandler_ReturnsAllocations()
        {
            // Arrange
            var header = new WBSHeader { Id = 1, ProjectId = 1, TenantId = 1, IsActive = true };
            var wbs = new WorkBreakdownStructure { Id = 1, WBSHeaderId = 1, TenantId = 1, WBSHeader = header };
            var task = new WBSTask 
            { 
                Id = 1, 
                WorkBreakdownStructureId = 1, 
                TenantId = 1, 
                Level = WBSTaskLevel.Level3,
                TaskType = TaskType.Manpower,
                WorkBreakdownStructure = wbs,
                Title = "T3"
            };
            _context.WBSHeaders.Add(header);
            _context.WorkBreakdownStructures.Add(wbs);
            _context.WBSTasks.Add(task);
            await _context.SaveChangesAsync();

            var userManagerMock = GetUserManagerMock();
            var handler = new GetWBSResourceDataQueryHandler(_context, userManagerMock.Object);
            var query = new GetWBSResourceDataQuery(1);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.ProjectId);
        }
    }
}
