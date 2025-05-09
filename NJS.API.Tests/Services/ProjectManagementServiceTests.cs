using Moq;
using NJS.Application.Services;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using Xunit;

namespace NJS.API.Tests.Services
{
    public class ProjectManagementServiceTests
    {
        private readonly Mock<IProjectRepository> _projectRepositoryMock;
        private readonly Mock<IFeasibilityStudyRepository> _feasibilityStudyRepositoryMock;
        private readonly Mock<IWorkBreakdownStructureRepository> _wbsRepositoryMock;
        private readonly Mock<IGoNoGoDecisionRepository> _goNoGoDecisionRepositoryMock;
        private readonly ProjectManagementService _service;

        public ProjectManagementServiceTests()
        {
            _projectRepositoryMock = new Mock<IProjectRepository>();
            _feasibilityStudyRepositoryMock = new Mock<IFeasibilityStudyRepository>();
            _wbsRepositoryMock = new Mock<IWorkBreakdownStructureRepository>();
            _goNoGoDecisionRepositoryMock = new Mock<IGoNoGoDecisionRepository>();
            
            _service = new ProjectManagementService(
                _projectRepositoryMock.Object,
                _feasibilityStudyRepositoryMock.Object,
                _wbsRepositoryMock.Object,
                _goNoGoDecisionRepositoryMock.Object);
        }

        [Fact]
        public void CreateProjectWithFeasibilityStudy_ShouldAddProjectAndFeasibilityStudy()
        {
            // Arrange
            var project = new Project { Name = "Test Project" };
            var feasibilityStudy = new FeasibilityStudy();

            // Act
            var result = _service.CreateProjectWithFeasibilityStudy(project, feasibilityStudy);

            // Assert
            Assert.Equal(project, result);
            Assert.Equal(project.Id, feasibilityStudy.ProjectId);
            _projectRepositoryMock.Verify(r => r.Add(project), Times.Once);
            _feasibilityStudyRepositoryMock.Verify(r => r.Add(feasibilityStudy), Times.Once);
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
            Assert.Equal(projectId, wbs.ProjectId);
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
        public void CreateFeasibilityStudy_ShouldAddFeasibilityStudy()
        {
            // Arrange
            var feasibilityStudy = new FeasibilityStudy { ProjectId = 1 };

            // Act
            var result = _service.CreateFeasibilityStudy(feasibilityStudy);

            // Assert
            Assert.Equal(feasibilityStudy, result);
            _feasibilityStudyRepositoryMock.Verify(r => r.Add(feasibilityStudy), Times.Once);
        }

        [Fact]
        public void GetFeasibilityStudy_ShouldReturnFeasibilityStudyForProject()
        {
            // Arrange
            var projectId = 1;
            var feasibilityStudy = new FeasibilityStudy { Id = 1, ProjectId = projectId };

            _feasibilityStudyRepositoryMock.Setup(r => r.GetByProjectId(projectId))
                .Returns(feasibilityStudy);

            // Act
            var result = _service.GetFeasibilityStudy(projectId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(projectId, result.ProjectId);
        }

        [Fact]
        public void UpdateFeasibilityStudy_ShouldCallRepositoryUpdate()
        {
            // Arrange
            var feasibilityStudy = new FeasibilityStudy { Id = 1, ProjectId = 1 };

            // Act
            _service.UpdateFeasibilityStudy(feasibilityStudy);

            // Assert
            _feasibilityStudyRepositoryMock.Verify(r => r.Update(feasibilityStudy), Times.Once);
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
            _goNoGoDecisionRepositoryMock.Verify(r => r.Add(decision), Times.Once);
        }

        [Fact]
        public void GetGoNoGoDecision_ShouldReturnDecisionForProject()
        {
            // Arrange
            var projectId = 1;
            var decision = new GoNoGoDecision { Id = 1, ProjectId = projectId };

            _goNoGoDecisionRepositoryMock.Setup(r => r.GetByProjectId(projectId))
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
            var wbs = new WorkBreakdownStructure { ProjectId = 1 };

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
            var wbs = new WorkBreakdownStructure { Id = 1, ProjectId = projectId };

            _wbsRepositoryMock.Setup(r => r.GetByProjectId(projectId))
                .Returns(wbs);

            // Act
            var result = _service.GetWBS(projectId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(projectId, result.ProjectId);
        }

        [Fact]
        public void UpdateWBS_ShouldCallRepositoryUpdate()
        {
            // Arrange
            var wbs = new WorkBreakdownStructure { Id = 1, ProjectId = 1 };

            // Act
            _service.UpdateWBS(wbs);

            // Assert
            _wbsRepositoryMock.Verify(r => r.Update(wbs), Times.Once);
        }
    }
}
