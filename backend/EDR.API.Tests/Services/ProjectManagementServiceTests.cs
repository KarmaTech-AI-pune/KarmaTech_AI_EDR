using Moq;
using EDR.Application.Services;
using EDR.Application.Services.IContract;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using Xunit;

namespace EDR.API.Tests.Services
{
    public class ProjectManagementServiceTests
    {
        private readonly Mock<IProjectRepository> _projectRepositoryMock;
        private readonly Mock<IWorkBreakdownStructureRepository> _wbsRepositoryMock;
        private readonly Mock<IGoNoGoDecisionService> _goNoGoDecisionServiceMock;
        private readonly ProjectManagementService _service;

        public ProjectManagementServiceTests()
        {
            _projectRepositoryMock = new Mock<IProjectRepository>();
            _wbsRepositoryMock = new Mock<IWorkBreakdownStructureRepository>();
            _goNoGoDecisionServiceMock = new Mock<IGoNoGoDecisionService>();
            
            _service = new ProjectManagementService(
                _projectRepositoryMock.Object,
                _wbsRepositoryMock.Object,
                _goNoGoDecisionServiceMock.Object);
        }

        [Fact]
        public void AddWorkBreakdownStructure_WithValidProjectId_ShouldAddWBS()
        {
            // Arrange
            var projectId = 1;
            var project = new Project { Id = projectId, Name = "Test Project" };
            var wbs = new WorkBreakdownStructure();

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns(project);

            // Act
            _service.AddWorkBreakdownStructure(projectId, wbs);

            // Assert
            _wbsRepositoryMock.Verify(r => r.Add(wbs), Times.Once);
        }

        [Fact]
        public void AddWorkBreakdownStructure_WithInvalidProjectId_ShouldThrowException()
        {
            // Arrange
            var projectId = 999;
            var wbs = new WorkBreakdownStructure();

            _projectRepositoryMock.Setup(r => r.GetById(projectId))
                .Returns((Project)null);

            // Act & Assert
            Assert.Throws<ArgumentException>(() => _service.AddWorkBreakdownStructure(projectId, wbs));
        }

        [Fact]
        public void SubmitGoNoGoDecision_ShouldAddDecision()
        {
            // Arrange
            var decision = new GoNoGoDecision { ProjectId = 1 };

            // Act
            var result = _service.SubmitGoNoGoDecision(decision);

            // Assert
            Assert.Equal(decision, result);
            _goNoGoDecisionServiceMock.Verify(s => s.Add(decision), Times.Once);
        }

        [Fact]
        public void GetGoNoGoDecision_ShouldReturnDecisionForProject()
        {
            // Arrange
            var projectId = 1;
            var decision = new GoNoGoDecision { Id = 1, ProjectId = projectId };

            _goNoGoDecisionServiceMock.Setup(s => s.GetByProjectId(projectId))
                .Returns(decision);

            // Act
            var result = _service.GetGoNoGoDecision(projectId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(projectId, result.ProjectId);
        }

        [Fact]
        public void CreateWBS_ShouldAddWBS()
        {
            // Arrange
            var wbs = new WorkBreakdownStructure { WBSHeaderId = 1 };

            // Act
            var result = _service.CreateWBS(wbs);

            // Assert
            Assert.Equal(wbs, result);
            _wbsRepositoryMock.Verify(r => r.Add(wbs), Times.Once);
        }

        [Fact]
        public void GetWBS_ShouldReturnWBSForProject()
        {
            // Arrange
            var projectId = 1;
            var wbs = new WorkBreakdownStructure { Id = 1, WBSHeader = new WBSHeader { ProjectId = projectId } };

            _wbsRepositoryMock.Setup(r => r.GetByProjectId(projectId))
                .Returns(wbs);

            // Act
            var result = _service.GetWBS(projectId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(projectId, result.WBSHeader.ProjectId);
        }

        [Fact]
        public void UpdateWBS_ShouldCallRepositoryUpdate()
        {
            // Arrange
            var wbs = new WorkBreakdownStructure { Id = 1 };

            // Act
            _service.UpdateWBS(wbs);

            // Assert
            _wbsRepositoryMock.Verify(r => r.Update(wbs), Times.Once);
        }
    }
}
