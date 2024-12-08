using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using NJSAPI.Controllers;

namespace NJS.API.Tests.Controllers
{
    public class ProjectsControllerTests
    {
        private readonly Mock<IProjectRepository> _mockProjectRepository;
        private readonly Mock<IProjectManagementService> _mockProjectManagementService;
        private readonly ProjectsController _controller;
        private readonly Mock< IMediator> _mediator;

        public ProjectsControllerTests()
        {
            _mockProjectRepository = new Mock<IProjectRepository>();
            _mockProjectManagementService = new Mock<IProjectManagementService>();
            _mediator= new Mock<IMediator>();
            _controller = new ProjectsController( _mockProjectRepository.Object, _mockProjectManagementService.Object, _mediator.Object);
        }

        [Fact]
        public async Task GetAll_ShouldReturnsOkResult_WithListOfProjects()
        {
            // Arrange
            var mockProjects = new List<Project>
            {
                new Project { Id = 1, Name = "Project 1" },
                new Project { Id = 2, Name = "Project 2" }
            };

            _mockProjectRepository.Setup(repo => repo.GetAll()).ReturnsAsync(mockProjects);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<List<Project>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public void GetById_ShouldReturnsOkResult_WhenProjectExistsWithProject()
        {
            // Arrange
            var projectId = 1;
            var mockProject = new Project { Id = projectId, Name = "Project 1" };
            _mockProjectRepository.Setup(repo => repo.GetById(projectId)).Returns(mockProject);

            // Act
            var result = _controller.GetById(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<Project>(okResult.Value);
            Assert.Equal(projectId, returnValue.Id);
        }

        [Fact]
        public void GetById_ShouldReturnsNotFound_WhenProjectDoesNotExist()
        {
            // Arrange
            var projectId = 1;
            _mockProjectRepository.Setup(repo => repo.GetById(projectId)).Returns((Project)null);

            // Act
            var result = _controller.GetById(projectId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

       

        [Fact]
        public void Update_ShouldReturnsNoContent_WhenProjectExists()
        {
            // Arrange
            var projectId = 1;
            var updatedProject = new Project { Id = projectId, Name = "Updated Project" };
            _mockProjectRepository.Setup(repo => repo.GetById(projectId)).Returns(updatedProject);
            _mockProjectRepository.Setup(repo => repo.Update(updatedProject)).Verifiable();

            // Act
            var result = _controller.Update(projectId, updatedProject);

            // Assert
            Assert.IsType<NoContentResult>(result);
            _mockProjectRepository.Verify();
        }

        [Fact]
        public void Update_ShouldReturnsNotFound_WhenProjectDoesNotExist()
        {
            // Arrange
            var projectId = 1;
            var updatedProject = new Project { Id = projectId, Name = "Updated Project" };
            _mockProjectRepository.Setup(repo => repo.GetById(projectId)).Returns((Project)null);

            // Act
            var result = _controller.Update(projectId, updatedProject);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public void Delete_ShouldReturnsNoContent_WhenProjectExists()
        {
            // Arrange
            var projectId = 1;
            var project = new Project { Id = projectId, Name = "Project 1" };
            _mockProjectRepository.Setup(repo => repo.GetById(projectId)).Returns(project);
            _mockProjectRepository.Setup(repo => repo.Delete(projectId)).Verifiable();

            // Act
            var result = _controller.Delete(projectId);

            // Assert
            Assert.IsType<NoContentResult>(result);
            _mockProjectRepository.Verify();
        }

        [Fact]
        public void Delete_ShouldReturnsNotFound_WhenProjectDoesNotExist()
        {
            // Arrange
            var projectId = 1;
            _mockProjectRepository.Setup(repo => repo.GetById(projectId)).Returns((Project)null);

            // Act
            var result = _controller.Delete(projectId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public void CreateFeasibilityStudy_ShouldReturnsCreatedAtAction_WhenProjectExists()
        {
            // Arrange
            var projectId = 1;
            var feasibilityStudy = new FeasibilityStudy { Id = 1, ProjectDetails = "Feasibility 1" };
            var project = new Project { Id = projectId, Name = "Project 1" };

            _mockProjectRepository.Setup(repo => repo.GetById(projectId)).Returns(project);
            _mockProjectManagementService.Setup(service => service.CreateFeasibilityStudy(It.IsAny<FeasibilityStudy>()));

            // Act
            var result = _controller.CreateFeasibilityStudy(projectId, feasibilityStudy);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal("GetFeasibilityStudy", createdAtActionResult.ActionName);
        }

        [Fact]
        public void GetFeasibilityStudy_ShouldReturnOk_WhenFeasibilityStudyExists()
        {
            // Arrange
            var projectId = 1;
            var feasibilityStudy = new FeasibilityStudy { Id = 1, ProjectDetails = "Feasibility 1" };

            _mockProjectManagementService.Setup(service => service.GetFeasibilityStudy(projectId)).Returns(feasibilityStudy);

            // Act
            var result = _controller.GetFeasibilityStudy(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = Assert.IsType<FeasibilityStudy>(okResult.Value);
            Assert.Equal(feasibilityStudy.Id, returnValue.Id);
        }

        [Fact(Skip ="Skip for time being")]
        public async Task Create_ReturnsCreatedAtAction_WhenValidProject()
        {
            // Arrange
            var newProject = new Project { Id = 1, Name = "New Project" };
           // _mockProjectRepository.Setup(repo => repo.Add(It.IsAny<Project>())).ReturnsAsync(newProject);

            // Act
            var result = await _controller.Create(newProject);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal("GetById", createdAtActionResult.ActionName);
            Assert.Equal(newProject.Id, createdAtActionResult.RouteValues["id"]);
            Assert.Equal(newProject, createdAtActionResult.Value);
        }
    }
}
