using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using NJS.Application.CQRS.Correspondence.Commands;
using NJS.Application.CQRS.Correspondence.Queries;
using NJS.Application.DTOs;
using NJSAPI.Controllers;
using NJS.Application.Services.IContract;
using NJS.Repositories.Interfaces;

namespace NJS.API.Tests.Controllers
{
    public class CorrespondenceControllerTests
    {
        private readonly Mock<IMediator> _mockMediator;
        private readonly Mock<ILogger<CorrespondenceController>> _mockLogger;
        private readonly CorrespondenceController _controller;

        public CorrespondenceControllerTests()
        {
            _mockMediator = new Mock<IMediator>();
            _mockLogger = new Mock<ILogger<CorrespondenceController>>();
            var tenantService = new Mock<ITenantService>();
            var currentUserService = new Mock<ICurrentUserService>();
           
            _controller = new CorrespondenceController(_mockMediator.Object, _mockLogger.Object,tenantService.Object, currentUserService.Object);
        }

        #region Inward Correspondence Tests

        [Fact]
        public async Task GetAllInward_ReturnsOkResult_WithCorrespondenceInwardDtos()
        {
            // Arrange
            var expectedInwards = new List<CorrespondenceInwardDto>
            {
                new CorrespondenceInwardDto
                {
                    Id = 1,
                    ProjectId = 1,
                    IncomingLetterNo = "PHED/2024/001",
                    LetterDate = new DateTime(2024, 1, 10),
                    NjsInwardNo = "NJS/IN/2024/001",
                    ReceiptDate = new DateTime(2024, 1, 11),
                    From = "Public Health Engineering Department",
                    Subject = "Revised Population Projections for STP Design"
                },
                new CorrespondenceInwardDto
                {
                    Id = 2,
                    ProjectId = 1,
                    IncomingLetterNo = "PHED/2024/002",
                    LetterDate = new DateTime(2024, 1, 20),
                    NjsInwardNo = "NJS/IN/2024/002",
                    ReceiptDate = new DateTime(2024, 1, 21),
                    From = "Public Health Engineering Department",
                    Subject = "Water Quality Parameters Update"
                }
            };

            _mockMediator.Setup(m => m.Send(It.IsAny<GetAllCorrespondenceInwardsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedInwards);

            // Act
            var result = await _controller.GetAllInward();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<CorrespondenceInwardDto>>(okResult.Value);
            Assert.Equal(expectedInwards.Count, ((List<CorrespondenceInwardDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetInwardById_WithValidId_ReturnsOkResult_WithCorrespondenceInwardDto()
        {
            // Arrange
            var expectedInward = new CorrespondenceInwardDto
            {
                Id = 1,
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = new DateTime(2024, 1, 10),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = new DateTime(2024, 1, 11),
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design"
            };

            _mockMediator.Setup(m => m.Send(It.Is<GetCorrespondenceInwardByIdQuery>(q => q.Id == 1), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedInward);

            // Act
            var result = await _controller.GetInwardById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<CorrespondenceInwardDto>(okResult.Value);
            Assert.Equal(expectedInward.Id, returnValue.Id);
            Assert.Equal(expectedInward.IncomingLetterNo, returnValue.IncomingLetterNo);
        }

        [Fact]
        public async Task GetInwardById_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            _mockMediator.Setup(m => m.Send(It.Is<GetCorrespondenceInwardByIdQuery>(q => q.Id == 999), It.IsAny<CancellationToken>()))
                .ReturnsAsync((CorrespondenceInwardDto)null);

            // Act
            var result = await _controller.GetInwardById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetInwardByProject_WithValidProjectId_ReturnsOkResult_WithCorrespondenceInwardDtos()
        {
            // Arrange
            var projectId = 1;
            var expectedInwards = new List<CorrespondenceInwardDto>
            {
                new CorrespondenceInwardDto
                {
                    Id = 1,
                    ProjectId = projectId,
                    IncomingLetterNo = "PHED/2024/001",
                    LetterDate = new DateTime(2024, 1, 10),
                    NjsInwardNo = "NJS/IN/2024/001",
                    ReceiptDate = new DateTime(2024, 1, 11),
                    From = "Public Health Engineering Department",
                    Subject = "Revised Population Projections for STP Design"
                },
                new CorrespondenceInwardDto
                {
                    Id = 2,
                    ProjectId = projectId,
                    IncomingLetterNo = "PHED/2024/002",
                    LetterDate = new DateTime(2024, 1, 20),
                    NjsInwardNo = "NJS/IN/2024/002",
                    ReceiptDate = new DateTime(2024, 1, 21),
                    From = "Public Health Engineering Department",
                    Subject = "Water Quality Parameters Update"
                }
            };

            _mockMediator.Setup(m => m.Send(It.Is<GetCorrespondenceInwardsByProjectQuery>(q => q.ProjectId == projectId), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedInwards);

            // Act
            var result = await _controller.GetInwardByProject(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<CorrespondenceInwardDto>>(okResult.Value);
            Assert.Equal(expectedInwards.Count, ((List<CorrespondenceInwardDto>)returnValue).Count);
            Assert.All(returnValue, item => Assert.Equal(projectId, item.ProjectId));
        }

        [Fact]
        public async Task CreateInward_WithValidCommand_ReturnsStatusCode500()
        {
            // Arrange
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = new DateTime(2024, 1, 10),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = new DateTime(2024, 1, 11),
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design"
            };

            var expectedDto = new CorrespondenceInwardDto
            {
                Id = 1,
                ProjectId = command.ProjectId,
                IncomingLetterNo = command.IncomingLetterNo,
                LetterDate = command.LetterDate,
                NjsInwardNo = command.NjsInwardNo,
                ReceiptDate = command.ReceiptDate,
                From = command.From,
                Subject = command.Subject,
                CreatedBy = "System",
                CreatedAt = DateTime.UtcNow
            };

            _mockMediator.Setup(m => m.Send(It.IsAny<CreateCorrespondenceInwardCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedDto);

            // Act
            var result = await _controller.CreateInward(command);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, objectResult.StatusCode);
        }

        [Fact]
        public async Task CreateInward_WithNullCommand_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.CreateInward(null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateInward_WithValidCommand_ReturnsStatusCode500()
        {
            // Arrange
            var id = 1;
            var command = new UpdateCorrespondenceInwardCommand
            {
                Id = id,
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001-Updated",
                LetterDate = new DateTime(2024, 1, 10),
                NjsInwardNo = "NJS/IN/2024/001-Updated",
                ReceiptDate = new DateTime(2024, 1, 11),
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design-Updated"
            };

            var expectedDto = new CorrespondenceInwardDto
            {
                Id = command.Id,
                ProjectId = command.ProjectId,
                IncomingLetterNo = command.IncomingLetterNo,
                LetterDate = command.LetterDate,
                NjsInwardNo = command.NjsInwardNo,
                ReceiptDate = command.ReceiptDate,
                From = command.From,
                Subject = command.Subject,
                UpdatedBy = "System",
                UpdatedAt = DateTime.UtcNow
            };

            _mockMediator.Setup(m => m.Send(It.IsAny<UpdateCorrespondenceInwardCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedDto);

            // Act
            var result = await _controller.UpdateInward(id, command);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, objectResult.StatusCode);
        }

        [Fact]
        public async Task UpdateInward_WithNullCommand_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.UpdateInward(1, null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateInward_WithMismatchedId_ReturnsBadRequest()
        {
            // Arrange
            var id = 1;
            var command = new UpdateCorrespondenceInwardCommand { Id = 2 }; // Mismatched ID

            // Act
            var result = await _controller.UpdateInward(id, command);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task DeleteInward_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var id = 1;
            _mockMediator.Setup(m => m.Send(It.Is<DeleteCorrespondenceInwardCommand>(c => c.Id == id), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteInward(id);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteInward_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var id = 999;
            _mockMediator.Setup(m => m.Send(It.Is<DeleteCorrespondenceInwardCommand>(c => c.Id == id), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteInward(id);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        #endregion

        #region Outward Correspondence Tests

        [Fact]
        public async Task GetAllOutward_ReturnsOkResult_WithCorrespondenceOutwardDtos()
        {
            // Arrange
            var expectedOutwards = new List<CorrespondenceOutwardDto>
            {
                new CorrespondenceOutwardDto
                {
                    Id = 1,
                    ProjectId = 1,
                    LetterNo = "NJS/OUT/2024/001",
                    LetterDate = new DateTime(2024, 1, 15),
                    To = "Public Health Engineering Department",
                    Subject = "Response to Population Projections for STP Design"
                },
                new CorrespondenceOutwardDto
                {
                    Id = 2,
                    ProjectId = 1,
                    LetterNo = "NJS/OUT/2024/002",
                    LetterDate = new DateTime(2024, 1, 24),
                    To = "Public Health Engineering Department",
                    Subject = "Advanced Oxidation Process Integration Plan"
                }
            };

            _mockMediator.Setup(m => m.Send(It.IsAny<GetAllCorrespondenceOutwardsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedOutwards);

            // Act
            var result = await _controller.GetAllOutward();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<CorrespondenceOutwardDto>>(okResult.Value);
            Assert.Equal(expectedOutwards.Count, ((List<CorrespondenceOutwardDto>)returnValue).Count);
        }

        [Fact]
        public async Task GetOutwardById_WithValidId_ReturnsOkResult_WithCorrespondenceOutwardDto()
        {
            // Arrange
            var expectedOutward = new CorrespondenceOutwardDto
            {
                Id = 1,
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = new DateTime(2024, 1, 15),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design"
            };

            _mockMediator.Setup(m => m.Send(It.Is<GetCorrespondenceOutwardByIdQuery>(q => q.Id == 1), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedOutward);

            // Act
            var result = await _controller.GetOutwardById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<CorrespondenceOutwardDto>(okResult.Value);
            Assert.Equal(expectedOutward.Id, returnValue.Id);
            Assert.Equal(expectedOutward.LetterNo, returnValue.LetterNo);
        }

        [Fact]
        public async Task GetOutwardById_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            _mockMediator.Setup(m => m.Send(It.Is<GetCorrespondenceOutwardByIdQuery>(q => q.Id == 999), It.IsAny<CancellationToken>()))
                .ReturnsAsync((CorrespondenceOutwardDto)null);

            // Act
            var result = await _controller.GetOutwardById(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetOutwardByProject_WithValidProjectId_ReturnsOkResult_WithCorrespondenceOutwardDtos()
        {
            // Arrange
            var projectId = 1;
            var expectedOutwards = new List<CorrespondenceOutwardDto>
            {
                new CorrespondenceOutwardDto
                {
                    Id = 1,
                    ProjectId = projectId,
                    LetterNo = "NJS/OUT/2024/001",
                    LetterDate = new DateTime(2024, 1, 15),
                    To = "Public Health Engineering Department",
                    Subject = "Response to Population Projections for STP Design"
                },
                new CorrespondenceOutwardDto
                {
                    Id = 2,
                    ProjectId = projectId,
                    LetterNo = "NJS/OUT/2024/002",
                    LetterDate = new DateTime(2024, 1, 24),
                    To = "Public Health Engineering Department",
                    Subject = "Advanced Oxidation Process Integration Plan"
                }
            };

            _mockMediator.Setup(m => m.Send(It.Is<GetCorrespondenceOutwardsByProjectQuery>(q => q.ProjectId == projectId), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedOutwards);

            // Act
            var result = await _controller.GetOutwardByProject(projectId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<CorrespondenceOutwardDto>>(okResult.Value);
            Assert.Equal(expectedOutwards.Count, ((List<CorrespondenceOutwardDto>)returnValue).Count);
            Assert.All(returnValue, item => Assert.Equal(projectId, item.ProjectId));
        }

        [Fact]
        public async Task CreateOutward_WithValidCommand_ReturnsStatusCode500()
        {
            // Arrange
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = new DateTime(2024, 1, 15),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design"
            };

            var expectedDto = new CorrespondenceOutwardDto
            {
                Id = 1,
                ProjectId = command.ProjectId,
                LetterNo = command.LetterNo,
                LetterDate = command.LetterDate,
                To = command.To,
                Subject = command.Subject,
                CreatedBy = "System",
                CreatedAt = DateTime.UtcNow
            };

            _mockMediator.Setup(m => m.Send(It.IsAny<CreateCorrespondenceOutwardCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedDto);

            // Act
            var result = await _controller.CreateOutward(command);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, objectResult.StatusCode);
        }

        [Fact]
        public async Task CreateOutward_WithNullCommand_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.CreateOutward(null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateOutward_WithValidCommand_ReturnsStatusCode500()
        {
            // Arrange
            var id = 1;
            var command = new UpdateCorrespondenceOutwardCommand
            {
                Id = id,
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001-Updated",
                LetterDate = new DateTime(2024, 1, 15),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design-Updated"
            };

            var expectedDto = new CorrespondenceOutwardDto
            {
                Id = command.Id,
                ProjectId = command.ProjectId,
                LetterNo = command.LetterNo,
                LetterDate = command.LetterDate,
                To = command.To,
                Subject = command.Subject,
                UpdatedBy = "System",
                UpdatedAt = DateTime.UtcNow
            };

            _mockMediator.Setup(m => m.Send(It.IsAny<UpdateCorrespondenceOutwardCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedDto);

            // Act
            var result = await _controller.UpdateOutward(id, command);

            // Assert
            var objectResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, objectResult.StatusCode);
        }

        [Fact]
        public async Task UpdateOutward_WithNullCommand_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.UpdateOutward(1, null);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateOutward_WithMismatchedId_ReturnsBadRequest()
        {
            // Arrange
            var id = 1;
            var command = new UpdateCorrespondenceOutwardCommand { Id = 2 }; // Mismatched ID

            // Act
            var result = await _controller.UpdateOutward(id, command);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task DeleteOutward_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var id = 1;
            _mockMediator.Setup(m => m.Send(It.Is<DeleteCorrespondenceOutwardCommand>(c => c.Id == id), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteOutward(id);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteOutward_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var id = 999;
            _mockMediator.Setup(m => m.Send(It.Is<DeleteCorrespondenceOutwardCommand>(c => c.Id == id), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteOutward(id);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        #endregion

        [Fact]
        public async Task Controller_WhenExceptionThrown_ReturnsStatusCode500()
        {
            // Arrange
            var expectedException = new Exception("Test exception");
            _mockMediator.Setup(m => m.Send(It.IsAny<GetAllCorrespondenceInwardsQuery>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(expectedException);

            // Act
            var result = await _controller.GetAllInward();

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            // The value is an anonymous type with message and error properties
            var value = statusCodeResult.Value;
            var valueDict = value.GetType().GetProperties();
            Assert.Contains(valueDict, p => p.Name == "message");
            Assert.Contains(valueDict, p => p.Name == "error");
        }
    }
}
