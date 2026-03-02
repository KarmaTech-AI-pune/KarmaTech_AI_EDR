using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using EDR.Application.CQRS.JobStartForm.Commands;
using EDR.Application.CQRS.JobStartForm.Queries;
using EDR.Application.Dtos;
using EDR.API.Controllers;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Controllers
{
    public class JobStartFormControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly JobStartFormController _controller;

        public JobStartFormControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new JobStartFormController(_mediatorMock.Object);
        }

        [Fact]
        public async Task GetAllJobStartForms_ReturnsOkResultWithForms()
        {
            // Arrange
            var projectId = 1;
            var forms = new List<JobStartFormDto>
            {
                new JobStartFormDto { FormId = 1, ProjectId = projectId, FormTitle = "Form 1" },
                new JobStartFormDto { FormId = 2, ProjectId = projectId, FormTitle = "Form 2" }
            };

            _mediatorMock.Setup(m => m.Send(It.Is<GetAllJobStartFormByProjectIdQuery>(q => q.ProjectId == projectId), It.IsAny<CancellationToken>()))
                .ReturnsAsync(forms);

            // Act
            var result = await _controller.GetAllJobStartForms(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<JobStartFormDto>>(okResult.Value);
            Assert.Equal(2, ((List<JobStartFormDto>)returnValue).Count());
        }

        [Fact]
        public async Task GetJobStartFormById_WithValidId_ReturnsOkResultWithForm()
        {
            // Arrange
            var projectId = 1;
            var formId = 1;
            var form = new JobStartFormDto { FormId = formId, ProjectId = projectId, FormTitle = "Form 1" };

            _mediatorMock.Setup(m => m.Send(It.Is<GetJobStartFormByIdQuery>(q => q.Id == formId), It.IsAny<CancellationToken>()))
                .ReturnsAsync(form);

            // Act
            var result = await _controller.GetJobStartFormById(projectId, formId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<JobStartFormDto>(okResult.Value);
            Assert.Equal(formId, returnValue.FormId);
        }

        [Fact]
        public async Task CreateJobStartForm_WithValidData_ReturnsCreatedAtActionResult()
        {
            // Arrange
            var projectId = 1;
            var formDto = new JobStartFormDto
            {
                ProjectId = projectId,
                FormTitle = "New Form",
                Description = "Description"
            };

            var createdFormId = 1;

            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateJobStartFormCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdFormId);

            var createdForm = new JobStartFormDto
            {
                FormId = createdFormId,
                ProjectId = projectId,
                FormTitle = formDto.FormTitle,
                Description = formDto.Description
            };

            _mediatorMock.Setup(m => m.Send(It.Is<GetJobStartFormByIdQuery>(q => q.Id == createdFormId), It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdForm);

            // Act
            var result = await _controller.CreateJobStartForm(projectId, formDto);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(nameof(_controller.GetJobStartFormById), createdAtActionResult.ActionName);
            Assert.Equal(createdFormId, createdAtActionResult.RouteValues["id"]);
        }

        [Fact]
        public async Task UpdateJobStartForm_WithValidData_ReturnsNoContent()
        {
            // Arrange
            var projectId = 1;
            var formId = 1;
            var formDto = new JobStartFormDto
            {
                FormId = formId,
                ProjectId = projectId,
                FormTitle = "Updated Form"
            };

            var existing = new JobStartFormDto { FormId = formId, ProjectId = projectId };

            _mediatorMock.Setup(m => m.Send(It.Is<GetJobStartFormByIdQuery>(q => q.Id == formId), It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);

            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateJobStartFormCommand>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.UpdateJobStartForm(projectId, formId, formDto);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteJobStartForm_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var projectId = 1;
            var formId = 1;
            var existing = new JobStartFormDto { FormId = formId, ProjectId = projectId };

            _mediatorMock.Setup(m => m.Send(It.Is<GetJobStartFormByIdQuery>(q => q.Id == formId), It.IsAny<CancellationToken>()))
                .ReturnsAsync(existing);

            _mediatorMock.Setup(m => m.Send(It.Is<DeleteJobStartFormCommand>(c => c.Id == formId), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.DeleteJobStartForm(projectId, formId);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }
    }
}
