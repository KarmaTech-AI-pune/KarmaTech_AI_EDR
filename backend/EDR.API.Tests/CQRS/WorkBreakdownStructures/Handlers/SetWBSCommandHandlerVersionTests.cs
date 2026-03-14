using EDR.Application.CQRS.WorkBreakdownStructures.Commands;
using EDR.Application.CQRS.WorkBreakdownStructures.Handlers;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.Services;
using EDR.Domain.UnitWork;
using EDR.Repositories.Interfaces;
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

namespace EDR.API.Tests.CQRS.WorkBreakdownStructures.Handlers
{
    public class SetWBSCommandHandlerVersionTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<IProjectHistoryService> _projectHistoryServiceMock;
        private readonly Mock<IUserContext> _userContextMock;
        private readonly Mock<IWBSVersionRepository> _wbsVersionRepositoryMock;
        private readonly Mock<IWBSOptionRepository> _wbsOptionRepositoryMock;
        private readonly Mock<ICurrentTenantService> _tenantServiceMock;

        public SetWBSCommandHandlerVersionTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _tenantServiceMock = new Mock<ICurrentTenantService>();
            _tenantServiceMock.SetupProperty(t => t.TenantId, 1);

            var configMock = new Mock<IConfiguration>();
            _context = new ProjectManagementContext(options, _tenantServiceMock.Object, configMock.Object);

            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _projectHistoryServiceMock = new Mock<IProjectHistoryService>();
            _userContextMock = new Mock<IUserContext>();
            _wbsVersionRepositoryMock = new Mock<IWBSVersionRepository>();
            _wbsOptionRepositoryMock = new Mock<IWBSOptionRepository>();

            _userContextMock.Setup(x => x.GetCurrentUserId()).Returns("test-user");
            _unitOfWorkMock.Setup(x => x.SaveChangesAsync()).Returns(() => _context.SaveChangesAsync());

            // Add a mock project
            _context.Projects.Add(new Project { Id = 1, Name = "Test Project", TenantId = 1 });
            _context.SaveChanges();
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        private SetWBSCommandHandler CreateHandler()
        {
            var loggerMock = new Mock<ILogger<SetWBSCommandHandler>>();
            return new SetWBSCommandHandler(
                _context,
                _unitOfWorkMock.Object,
                _projectHistoryServiceMock.Object,
                _userContextMock.Object,
                loggerMock.Object,
                _wbsVersionRepositoryMock.Object,
                _wbsOptionRepositoryMock.Object);
        }

        private WBSMasterDto CreateWBSMasterWithTask(int headerId)
        {
            return new WBSMasterDto
            {
                WbsHeaderId = headerId,
                WorkBreakdownStructures = new List<WBSStructureMasterDto>
                {
                    new WBSStructureMasterDto
                    {
                        WorkBreakdownStructureId = 1,
                        Name = "Group 1",
                        Tasks = new List<WBSTaskDto>
                        {
                            new WBSTaskDto
                            {
                                Id = 0,
                                Title = "Task 1",
                                TaskType = TaskType.Manpower,
                                Level = WBSTaskLevel.Level1,
                                PlannedHours = new List<PlannedHourDto>
                                {
                                    new PlannedHourDto { Year = 2024, Month = "Jan", PlannedHours = 10 }
                                }
                            }
                        }
                    }
                }
            };
        }

        [Fact]
        public async Task Handle_NewWBS_SetsVersionTo10()
        {
            // Arrange
            var handler = CreateHandler();
            var command = new SetWBSCommand(1, CreateWBSMasterWithTask(0));

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            var header = await _context.WBSHeaders.FirstAsync(h => h.ProjectId == 1);
            Assert.Equal("1.0", header.Version);
            
            var plannedHeaders = await _context.Set<WBSTaskPlannedHourHeader>().Where(h => h.ProjectId == 1).ToListAsync();
            Assert.Single(plannedHeaders);
            Assert.Equal("1.0", plannedHeaders[0].Version);
        }

        [Fact]
        public async Task Handle_ExistingInitialWBS_IncrementsMinorVersion_KeepsSameRecord()
        {
            // Arrange
            var header = new WBSHeader
            {
                ProjectId = 1,
                TenantId = 1,
                Version = "1.0",
                ApprovalStatus = PMWorkflowStatusEnum.Initial,
                IsActive = true
            };
            _context.WBSHeaders.Add(header);
            
            var plannedHeader = new WBSTaskPlannedHourHeader
            {
                ProjectId = 1,
                TenantId = 1,
                Version = "1.0",
                TaskType = TaskType.Manpower,
                StatusId = (int)PMWorkflowStatusEnum.Initial
            };
            _context.Set<WBSTaskPlannedHourHeader>().Add(plannedHeader);
            await _context.SaveChangesAsync();
            int originalPlannedHeaderId = plannedHeader.Id;

            var handler = CreateHandler();
            var command = new SetWBSCommand(1, CreateWBSMasterWithTask(header.Id));

            // Act
            await handler.Handle(command, CancellationToken.None);

            // Assert
            await _context.Entry(header).ReloadAsync();
            Assert.Equal("1.1", header.Version);

            // Verify the SAME WBSTaskPlannedHourHeader was used
            var headers = await _context.Set<WBSTaskPlannedHourHeader>().Where(h => h.ProjectId == 1).ToListAsync();
            Assert.Single(headers); 
            Assert.Equal(originalPlannedHeaderId, headers[0].Id);
            Assert.Equal("1.1", headers[0].Version);
        }

        [Fact]
        public async Task Handle_ExistingApprovedWBS_IncrementsMajorVersion_CreatesNewRecord()
        {
            // Arrange
            var header = new WBSHeader
            {
                ProjectId = 1,
                TenantId = 1,
                Version = "1.2",
                ApprovalStatus = PMWorkflowStatusEnum.Approved,
                IsActive = true
            };
            _context.WBSHeaders.Add(header);
            
            var plannedHeader = new WBSTaskPlannedHourHeader
            {
                ProjectId = 1,
                TenantId = 1,
                Version = "1.2",
                TaskType = TaskType.Manpower,
                StatusId = (int)PMWorkflowStatusEnum.Approved
            };
            _context.Set<WBSTaskPlannedHourHeader>().Add(plannedHeader);
            await _context.SaveChangesAsync();

            var handler = CreateHandler();
            var command = new SetWBSCommand(1, CreateWBSMasterWithTask(header.Id));

            // Act
            await handler.Handle(command, CancellationToken.None);

            // Assert
            await _context.Entry(header).ReloadAsync();
            Assert.Equal("2.0", header.Version);
            Assert.Equal(PMWorkflowStatusEnum.Initial, header.ApprovalStatus);

            // Verify a NEW WBSTaskPlannedHourHeader was created for version 2.0
            var headers = await _context.Set<WBSTaskPlannedHourHeader>()
                .Where(h => h.ProjectId == 1)
                .OrderBy(h => h.Id)
                .ToListAsync();
            Assert.Equal(2, headers.Count); // 1.2 and 2.0
            Assert.Equal("1.2", headers[0].Version);
            Assert.Equal("2.0", headers[1].Version);
        }

        [Fact]
        public async Task Handle_ApprovedWBS_InitializesVersionWorkflowHistory()
        {
            // Arrange
            var project = await _context.Projects.FirstAsync(p => p.Id == 1);
            project.ProjectManagerId = "pm-user";
            project.SeniorProjectManagerId = "spm-user";
            project.RegionalManagerId = "rm-user";
            
            // Add users to context to pass validation
            _context.Users.AddRange(new List<User>
            {
                new User { Id = "pm-user", UserName = "PM" },
                new User { Id = "spm-user", UserName = "SPM" },
                new User { Id = "rm-user", UserName = "RM" }
            });

            var header = new WBSHeader
            {
                ProjectId = 1,
                TenantId = 1,
                Version = "1.0",
                ApprovalStatus = PMWorkflowStatusEnum.Approved,
                IsActive = true,
                CreatedBy = "system"
            };
            _context.WBSHeaders.Add(header);
            
            var plannedHeader = new WBSTaskPlannedHourHeader
            {
                ProjectId = 1,
                TenantId = 1,
                Version = "1.0",
                TaskType = TaskType.Manpower,
                StatusId = (int)PMWorkflowStatusEnum.Approved
            };
            _context.Set<WBSTaskPlannedHourHeader>().Add(plannedHeader);
            await _context.SaveChangesAsync();

            var handler = CreateHandler();
            var command = new SetWBSCommand(1, CreateWBSMasterWithTask(header.Id));

            // Act
            await handler.Handle(command, CancellationToken.None);

            // Assert
            var newVersion = await _context.WBSVersionHistories
                .Include(v => v.WorkflowHistories)
                .OrderByDescending(v => v.Id)
                .FirstAsync(v => v.WBSHeaderId == header.Id && v.Version == "2.0");

            Assert.Equal(3, newVersion.WorkflowHistories.Count);
            Assert.All(newVersion.WorkflowHistories, h => Assert.Equal((int)PMWorkflowStatusEnum.Initial, h.StatusId));
            Assert.Contains(newVersion.WorkflowHistories, h => h.AssignedToId == "pm-user");
            Assert.Contains(newVersion.WorkflowHistories, h => h.AssignedToId == "spm-user");
            Assert.Contains(newVersion.WorkflowHistories, h => h.AssignedToId == "rm-user");
        }
    }
}
