using Microsoft.AspNetCore.Identity;
using Moq;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Services
{
    public class GoNoGoDecisionServiceTests
    {
        private readonly Mock<IGoNoGoDecisionRepository> _repositoryMock;
        private readonly Mock<IUserContext> _userContextMock;
        private readonly Mock<UserManager<User>> _userManagerMock;
        private readonly Mock<RoleManager<Role>> _roleManagerMock;
        private readonly GoNoGoDecisionService _service;

        public GoNoGoDecisionServiceTests()
        {
            _repositoryMock = new Mock<IGoNoGoDecisionRepository>();
            _userContextMock = new Mock<IUserContext>();
            
            // Mock UserManager
            var userStoreMock = new Mock<IUserStore<User>>();
            _userManagerMock = new Mock<UserManager<User>>(
                userStoreMock.Object, null, null, null, null, null, null, null, null);
            
            // Mock RoleManager
            var roleStoreMock = new Mock<IRoleStore<Role>>();
            _roleManagerMock = new Mock<RoleManager<Role>>(
                roleStoreMock.Object, null, null, null, null);
            
            _service = new GoNoGoDecisionService(
                _repositoryMock.Object, 
                _userContextMock.Object, 
                _roleManagerMock.Object, 
                _userManagerMock.Object);
        }

        [Fact]
        public void GetAll_ShouldReturnAllDecisions()
        {
            // Arrange
            var decisions = new List<GoNoGoDecision>
            {
                new GoNoGoDecision { Id = 1, ProjectName = "Project 1" },
                new GoNoGoDecision { Id = 2, ProjectName = "Project 2" }
            };

            _repositoryMock.Setup(r => r.GetAll())
                .Returns(decisions);

            // Act
            var result = _service.GetAll();

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Contains(result, d => d.ProjectName == "Project 1");
            Assert.Contains(result, d => d.ProjectName == "Project 2");
        }

        [Fact]
        public void GetById_ShouldReturnDecision()
        {
            // Arrange
            var decisionId = 1;
            var decision = new GoNoGoDecision { Id = decisionId, ProjectName = "Test Project" };

            _repositoryMock.Setup(r => r.GetById(decisionId))
                .Returns(decision);

            // Act
            var result = _service.GetById(decisionId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(decisionId, result.Id);
            Assert.Equal("Test Project", result.ProjectName);
        }

        [Fact]
        public void GetByProjectId_ShouldReturnDecision()
        {
            // Arrange
            var projectId = 1;
            var decision = new GoNoGoDecision { Id = 1, ProjectId = projectId, ProjectName = "Test Project" };

            _repositoryMock.Setup(r => r.GetByProjectId(projectId))
                .Returns(decision);

            // Act
            var result = _service.GetByProjectId(projectId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(projectId, result.ProjectId);
            Assert.Equal("Test Project", result.ProjectName);
        }

        [Fact]
        public void Add_ShouldCallRepositoryAdd()
        {
            // Arrange
            var decision = new GoNoGoDecision { ProjectName = "New Project" };

            // Act
            _service.Add(decision);

            // Assert
            _repositoryMock.Verify(r => r.Add(decision), Times.Once);
        }

        [Fact]
        public void Update_ShouldCallRepositoryUpdate()
        {
            // Arrange
            var decision = new GoNoGoDecision { Id = 1, ProjectName = "Updated Project" };

            // Act
            _service.Update(decision);

            // Assert
            _repositoryMock.Verify(r => r.Update(decision), Times.Once);
        }

        [Fact]
        public void Delete_ShouldCallRepositoryDelete()
        {
            // Arrange
            var decisionId = 1;

            // Act
            _service.Delete(decisionId);

            // Assert
            _repositoryMock.Verify(r => r.Delete(decisionId), Times.Once);
        }

        [Fact]
        public async Task CreateVersion_ShouldSetCurrentUserAndCallRepository()
        {
            // Arrange
            var userId = "user123";
            var version = new GoNoGoVersion
            {
                GoNoGoDecisionHeaderId = 1,
                FormData = "{}"
            };

            _userContextMock.Setup(u => u.GetCurrentUserId())
                .Returns(userId);

            _repositoryMock.Setup(r => r.CreateVersion(It.IsAny<GoNoGoVersion>()))
                .ReturnsAsync(version);

            // Act
            var result = await _service.CreateVersion(version);

            // Assert
            Assert.Equal(userId, result.ActonBy);
            _repositoryMock.Verify(r => r.CreateVersion(version), Times.Once);
        }

        [Fact]
        public async Task GetVersions_ShouldReturnVersionsForHeader()
        {
            // Arrange
            var headerId = 1;
            var versions = new List<GoNoGoVersion>
            {
                new GoNoGoVersion { Id = 1, GoNoGoDecisionHeaderId = headerId, VersionNumber = 1 },
                new GoNoGoVersion { Id = 2, GoNoGoDecisionHeaderId = headerId, VersionNumber = 2 }
            };

            _repositoryMock.Setup(r => r.GetVersions(headerId))
                .ReturnsAsync(versions);

            // Act
            var result = await _service.GetVersions(headerId);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Contains(result, v => v.VersionNumber == 1);
            Assert.Contains(result, v => v.VersionNumber == 2);
        }

        [Fact]
        public async Task GetVersion_ShouldReturnSpecificVersion()
        {
            // Arrange
            var headerId = 1;
            var versionNumber = 2;
            var version = new GoNoGoVersion
            {
                Id = 2,
                GoNoGoDecisionHeaderId = headerId,
                VersionNumber = versionNumber
            };

            _repositoryMock.Setup(r => r.GetVersion(headerId, versionNumber))
                .ReturnsAsync(version);

            // Act
            var result = await _service.GetVersion(headerId, versionNumber);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(headerId, result.GoNoGoDecisionHeaderId);
            Assert.Equal(versionNumber, result.VersionNumber);
        }

        [Fact]
        public async Task ApproveVersion_ShouldCallRepositoryApproveVersion()
        {
            // Arrange
            var headerId = 1;
            var versionNumber = 1;
            var approver = "approver123";
            var comments = "Approved";
            var version = new GoNoGoVersion
            {
                Id = 1,
                GoNoGoDecisionHeaderId = headerId,
                VersionNumber = versionNumber,
                Status = GoNoGoVersionStatus.BDM_APPROVED
            };

            _repositoryMock.Setup(r => r.ApproveVersion(headerId, versionNumber, approver, comments))
                .ReturnsAsync(version);

            // Act
            var result = await _service.ApproveVersion(headerId, versionNumber, approver, comments);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(GoNoGoVersionStatus.BDM_APPROVED, result.Status);
            _repositoryMock.Verify(r => r.ApproveVersion(headerId, versionNumber, approver, comments), Times.Once);
        }

        [Fact]
        public async Task UpdateVersionStatus_ShouldCallRepositoryUpdateVersionStatus()
        {
            // Arrange
            var headerId = 1;
            var newStatus = GoNoGoVersionStatus.RM_APPROVED;

            _repositoryMock.Setup(r => r.UpdateVersionStatus(headerId, newStatus))
                .ReturnsAsync(true);

            // Act
            var result = await _service.UpdateVersionStatus(headerId, newStatus);

            // Assert
            Assert.True(result);
            _repositoryMock.Verify(r => r.UpdateVersionStatus(headerId, newStatus), Times.Once);
        }

        [Fact]
        public async Task GetHeaderById_ShouldReturnHeader()
        {
            // Arrange
            var headerId = 1;
            var header = new GoNoGoDecisionHeader { Id = headerId };

            _repositoryMock.Setup(r => r.GetHeaderById(headerId))
                .ReturnsAsync(header);

            // Act
            var result = await _service.GetHeaderById(headerId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(headerId, result.Id);
        }

        [Fact]
        public async Task GetByOpportunityId_ShouldReturnHeader()
        {
            // Arrange
            var opportunityId = 1;
            var header = new GoNoGoDecisionHeader { Id = 1, OpportunityId = opportunityId };

            _repositoryMock.Setup(r => r.GetByOpportunityId(opportunityId))
                .ReturnsAsync(header);

            // Act
            var result = await _service.GetByOpportunityId(opportunityId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(opportunityId, result.OpportunityId);
        }

        [Fact]
        public async Task AddHeader_ShouldCallRepositoryAddHeader()
        {
            // Arrange
            var header = new GoNoGoDecisionHeader { OpportunityId = 1 };

            _repositoryMock.Setup(r => r.AddHeader(header))
                .ReturnsAsync(header);

            // Act
            var result = await _service.AddHeader(header);

            // Assert
            Assert.NotNull(result);
            _repositoryMock.Verify(r => r.AddHeader(header), Times.Once);
        }

        [Fact]
        public async Task UpdateHeader_ShouldCallRepositoryUpdateHeader()
        {
            // Arrange
            var header = new GoNoGoDecisionHeader { Id = 1, OpportunityId = 1 };

            _repositoryMock.Setup(r => r.UpdateHeader(header))
                .ReturnsAsync(true);

            // Act
            var result = await _service.UpdateHeader(header);

            // Assert
            Assert.True(result);
            _repositoryMock.Verify(r => r.UpdateHeader(header), Times.Once);
        }
    }
}
