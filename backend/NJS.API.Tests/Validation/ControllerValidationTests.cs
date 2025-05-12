using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using MediatR;
using NJS.Application.CQRS.JobStartForm.Commands;
using NJS.Application.CQRS.Projects.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using NJSAPI.Controllers;
using Xunit;

namespace NJS.API.Tests.Validation
{
    public class ControllerValidationTests
    {
        [Fact]
        public async Task CreateJobStartForm_WithInvalidModelState_ShouldReturnBadRequest()
        {
            // Arrange
            var mockMediator = new Mock<IMediator>();
            var controller = new JobStartFormController(mockMediator.Object);

            // Add a model error to simulate invalid model state
            controller.ModelState.AddModelError("FormTitle", "The Form Title field is required.");

            var jobStartFormDto = new JobStartFormDto
            {
                ProjectId = 1,
                // FormTitle is missing
                Description = "Test Description"
            };

            // Act
            var result = await controller.CreateJobStartForm(1, jobStartFormDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(badRequestResult.Value);

            // The response should contain validation errors
            var modelStateErrors = badRequestResult.Value as Dictionary<string, string[]>;
            Assert.NotNull(modelStateErrors);
            Assert.Contains("FormTitle", modelStateErrors.Keys);
        }

        [Fact]
        public async Task CreateJobStartForm_WithValidData_ShouldReturnCreatedAtAction()
        {
            // Arrange
            var mockMediator = new Mock<IMediator>();
            mockMediator.Setup(m => m.Send(It.IsAny<CreateJobStartFormCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(1); // Return a valid ID

            var controller = new JobStartFormController(mockMediator.Object);

            var jobStartFormDto = new JobStartFormDto
            {
                ProjectId = 1,
                FormTitle = "Test Form",
                Description = "Test Description",
                StartDate = DateTime.UtcNow,
                PreparedBy = "Test User"
            };

            // Act
            var result = await controller.CreateJobStartForm(1, jobStartFormDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal("GetJobStartFormById", createdAtActionResult.ActionName);
            Assert.Equal(1, createdAtActionResult.RouteValues["id"]);
        }

        [Fact]
        public async Task UpdateProject_WithNonExistentProject_ShouldReturnNotFound()
        {
            // Arrange
            var mockMediator = new Mock<IMediator>();
            mockMediator.Setup(m => m.Send(It.IsAny<UpdateProjectCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new ApplicationException("Project not found"));

            var controller = new ProjectController(mockMediator.Object, null);

            var projectDto = new ProjectDto
            {
                Id = 999, // Non-existent project ID
                Name = "Updated Project"
            };

            // Act
            var result = await controller.Update(999, projectDto);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("Project not found", notFoundResult.Value.ToString());
        }

        [Fact]
        public void ModelValidationErrorExample_ShouldShowDetailedErrors()
        {
            // This test demonstrates how model validation errors would be displayed to the user

            // Create a controller and add model errors
            var controller = new JobStartFormController(Mock.Of<IMediator>());

            // Add various types of validation errors
            controller.ModelState.AddModelError("ProjectId", "The Project ID field is required.");
            controller.ModelState.AddModelError("FormTitle", "The Form Title field is required.");
            controller.ModelState.AddModelError("StartDate", "The Start Date field is not a valid date.");
            controller.ModelState.AddModelError("GrandTotal", "The Grand Total must be a positive number.");

            // Get the validation errors as they would be returned to the client
            var actionResult = controller.ValidationProblem();
            var validationProblemDetails = Assert.IsType<ValidationProblemDetails>(
                (actionResult as ObjectResult)?.Value);

            // Assert that we have the expected validation errors
            Assert.Equal(4, validationProblemDetails.Errors.Count);
            Assert.Contains("ProjectId", validationProblemDetails.Errors.Keys);
            Assert.Contains("FormTitle", validationProblemDetails.Errors.Keys);
            Assert.Contains("StartDate", validationProblemDetails.Errors.Keys);
            Assert.Contains("GrandTotal", validationProblemDetails.Errors.Keys);

            // Check the specific error messages
            Assert.Equal("The Project ID field is required.",
                validationProblemDetails.Errors["ProjectId"][0]);
            Assert.Equal("The Form Title field is required.",
                validationProblemDetails.Errors["FormTitle"][0]);
            Assert.Equal("The Start Date field is not a valid date.",
                validationProblemDetails.Errors["StartDate"][0]);
            Assert.Equal("The Grand Total must be a positive number.",
                validationProblemDetails.Errors["GrandTotal"][0]);

            // Display the validation errors
            foreach (var error in validationProblemDetails.Errors)
            {
                Console.WriteLine($"Property: {error.Key}, Error: {string.Join(", ", error.Value)}");
            }

            // In a real application, these errors would be returned to the client
            // as part of a 400 Bad Request response with application/problem+json content type
        }
    }
}
