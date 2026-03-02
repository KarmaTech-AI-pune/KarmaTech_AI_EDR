using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using EDR.Application.CQRS.JobStartForm.Commands;
using EDR.Application.CQRS.JobStartForm.Handlers;
using EDR.Application.CQRS.Projects.Commands;
using EDR.Application.CQRS.Projects.Handlers;
using EDR.Application.CQRS.Users.Commands;
using EDR.Application.CQRS.Users.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Domain.UnitWork;
using EDR.Repositories.Interfaces;
using Xunit;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace EDR.API.Tests.Validation
{
    public class CommandValidationTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IJobStartFormRepository> _mockRepository;
        private readonly Mock<IProjectRepository> _mockProjectRepository;

        public CommandValidationTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockRepository = new Mock<IJobStartFormRepository>();
            _mockProjectRepository = new Mock<IProjectRepository>();
        }

        [Fact]
        public void CreateJobStartFormCommand_WithNullJobStartForm_ShouldThrowArgumentNullException()
        {
            // Act & Assert
            var exception = Assert.Throws<ArgumentNullException>(
                () => new CreateJobStartFormCommand(null)
            );

            Assert.Equal("jobStartForm", exception.ParamName);
        }

        [Fact]
        public async Task CreateJobStartFormCommand_WithInvalidProjectId_ShouldThrowArgumentException()
        {
            // Arrange
            var handler = new CreateJobStartFormCommandHandler(_mockRepository.Object, _mockUnitOfWork.Object, _mockProjectRepository.Object);

            var jobStartFormDto = new JobStartFormDto
            {
                ProjectId = 0, // Invalid ProjectId
                FormTitle = "Test Form",
                Description = "Test Description"
            };

            var command = new CreateJobStartFormCommand(jobStartFormDto);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(
                () => handler.Handle(command, CancellationToken.None)
            );

            Assert.Equal("ProjectId", exception.ParamName);
            Assert.Contains("Invalid ProjectId", exception.Message);
        }

        [Fact]
        public async Task CreateJobStartFormCommand_WithValidData_ShouldNotThrowException()
        {
            // Arrange
            _mockRepository.Setup(repo => repo.AddAsync(It.IsAny<JobStartForm>()))
                .Returns(Task.CompletedTask);

            _mockUnitOfWork.Setup(uow => uow.SaveChangesAsync())
                .ReturnsAsync(1);

            var handler = new CreateJobStartFormCommandHandler(_mockRepository.Object, _mockUnitOfWork.Object, _mockProjectRepository.Object);

            var jobStartFormDto = new JobStartFormDto
            {
                ProjectId = 1, // Valid ProjectId
                FormTitle = "Test Form",
                Description = "Test Description",
                StartDate = DateTime.UtcNow,
                PreparedBy = "Test User"
            };

            var command = new CreateJobStartFormCommand(jobStartFormDto);

            // Act & Assert
            // This should not throw an exception
            var result = await handler.Handle(command, CancellationToken.None);

            // Verify the repository was called with a valid entity
            _mockRepository.Verify(repo => repo.AddAsync(It.Is<JobStartForm>(
                jsf => jsf.ProjectId == 1 &&
                       jsf.FormTitle == "Test Form" &&
                       jsf.Description == "Test Description"
            )), Times.Once);
        }

        //[Fact]
        //public async Task CreateUserCommand_WithInvalidData_ShouldThrowException()
        //{
        //    // Arrange
        //    var mockUserManager = new Mock<UserManager<User>>(
        //        Mock.Of<IUserStore<User>>(), null, null, null, null, null, null, null, null);

        //    mockUserManager.Setup(um => um.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
        //        .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Password too weak" }));

        //    var handler = new CreateUserCommandHandler(mockUserManager.Object);

        //    var command = new CreateUserCommand
        //    {
        //        UserName = "testuser",
        //        Email = "test@example.com",
        //        Name = "Test User",
        //        Password = "weak" // Invalid password
        //    };

        //    // Act & Assert
        //    var exception = await Assert.ThrowsAsync<ApplicationException>(
        //        () => handler.Handle(command, CancellationToken.None)
        //    );

        //    Assert.Contains("Failed to create user", exception.Message);
        //    Assert.Contains("Password too weak", exception.Message);
        //}

        //[Fact]
        //public async Task UpdateProjectCommand_WithNonExistentProject_ShouldThrowException()
        //{
        //    // Arrange
        //    var mockRepository = new Mock<IProjectRepository>();
        //    mockRepository.Setup(repo => repo.GetById(It.IsAny<int>()))
        //        .Returns((Project)null); // Project not found

        //    var handler = new UpdateProjectCommandHandler(mockRepository.Object);

        //    var projectDto = new ProjectDto
        //    {
        //        Id = 999, // Non-existent project ID
        //        Name = "Updated Project",
        //        ProjectManagerId = "user123"
        //    };

        //    var command = new UpdateProjectCommand(999,projectDto);

        //    // Act & Assert
        //    var exception = await Assert.ThrowsAsync<ApplicationException>(
        //        () => handler.Handle(command, CancellationToken.None)
        //    );

        //    Assert.Contains("Project not found", exception.Message);
        //}

        [Fact]
        public void ValidationErrorExample_RequiredField()
        {
            // This test demonstrates a required field validation error

            // Example: Required field validation error
            var requiredFieldError = new ValidationResult(
                "The Project Name field is required.",
                new[] { "Name" }
            );

            // Assert that the error message is descriptive
            Assert.Contains("required", requiredFieldError.ErrorMessage.ToLower());
            Assert.Contains("Name", requiredFieldError.MemberNames);

            // Display the error message
            //Console.WriteLine($"Property: {string.Join(", ", requiredFieldError.MemberNames)}, Error: {requiredFieldError.ErrorMessage}");
        }

        [Fact]
        public void ValidationErrorExample_RangeValidation()
        {
            // This test demonstrates a range validation error

            // Example: Range validation error
            var rangeValidationError = new ValidationResult(
                "The field Score must be between 0 and 10.",
                new[] { "Score" }
            );

            // Assert that the error message is descriptive
            Assert.Contains("between 0 and 10", rangeValidationError.ErrorMessage);
            Assert.Contains("Score", rangeValidationError.MemberNames);

            // Display the error message
            Console.WriteLine($"Property: {string.Join(", ", rangeValidationError.MemberNames)}, Error: {rangeValidationError.ErrorMessage}");
        }

        [Fact]
        public void ValidationErrorExample_StringLength()
        {
            // This test demonstrates a string length validation error

            // Example: String length validation error
            var stringLengthError = new ValidationResult(
                "The field Description must not exceed 1000 characters.",
                new[] { "Description" }
            );

            // Assert that the error message is descriptive
            Assert.Contains("1000 characters", stringLengthError.ErrorMessage);
            Assert.Contains("Description", stringLengthError.MemberNames);

            // Display the error message
            Console.WriteLine($"Property: {string.Join(", ", stringLengthError.MemberNames)}, Error: {stringLengthError.ErrorMessage}");
        }
    }
}

