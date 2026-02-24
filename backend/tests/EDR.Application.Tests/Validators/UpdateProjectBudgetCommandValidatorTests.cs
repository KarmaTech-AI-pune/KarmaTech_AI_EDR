using FluentValidation.TestHelper;
using Moq;
using EDR.Application.CQRS.Projects.Commands;
using EDR.Application.CQRS.Projects.Validators;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading.Tasks;
using Xunit;

namespace EDR.Application.Tests.Validators
{
    public class UpdateProjectBudgetCommandValidatorTests
    {
        private readonly Mock<IProjectRepository> _projectRepositoryMock;
        private readonly UpdateProjectBudgetCommandValidator _validator;

        public UpdateProjectBudgetCommandValidatorTests()
        {
            _projectRepositoryMock = new Mock<IProjectRepository>();
            _validator = new UpdateProjectBudgetCommandValidator(_projectRepositoryMock.Object);
        }

        #region ProjectId Validation

        [Fact]
        public async Task Validate_ProjectIdZero_ShouldHaveError()
        {
            // Arrange
            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 0,
                EstimatedProjectCost = 100000m,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.ProjectId)
                .WithErrorMessage("ProjectId must be greater than 0");
        }

        [Fact]
        public async Task Validate_ProjectIdNegative_ShouldHaveError()
        {
            // Arrange
            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = -1,
                EstimatedProjectCost = 100000m,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.ProjectId);
        }

        [Fact]
        public async Task Validate_ProjectDoesNotExist_ShouldHaveError()
        {
            // Arrange
            _projectRepositoryMock.Setup(r => r.GetById(It.IsAny<int>()))
                .Returns((Project?)null);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 999,
                EstimatedProjectCost = 100000m,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.ProjectId)
                .WithErrorMessage("Project with the specified ID does not exist");
        }

        #endregion

        #region Budget Field Validation

        [Fact]
        public async Task Validate_NoBudgetFieldsProvided_ShouldHaveError()
        {
            // Arrange
            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                ChangedBy = "test@example.com"
                // No EstimatedProjectCost or EstimatedProjectFee
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x)
                .WithErrorMessage("At least one budget field (EstimatedProjectCost or EstimatedProjectFee) must be provided");
        }

        [Fact]
        public async Task Validate_OnlyEstimatedProjectCost_ShouldNotHaveError()
        {
            // Arrange
            var project = new Project 
            { 
                Id = 1, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m 
            };
            
            _projectRepositoryMock.Setup(r => r.GetById(1))
                .Returns(project);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectCost = 150000m,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x);
        }

        [Fact]
        public async Task Validate_OnlyEstimatedProjectFee_ShouldNotHaveError()
        {
            // Arrange
            var project = new Project 
            { 
                Id = 1, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m 
            };
            
            _projectRepositoryMock.Setup(r => r.GetById(1))
                .Returns(project);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectFee = 75000m,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x);
        }

        [Fact]
        public async Task Validate_NegativeEstimatedProjectCost_ShouldHaveError()
        {
            // Arrange
            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectCost = -100m,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.EstimatedProjectCost)
                .WithErrorMessage("EstimatedProjectCost must be greater than or equal to 0");
        }

        [Fact]
        public async Task Validate_NegativeEstimatedProjectFee_ShouldHaveError()
        {
            // Arrange
            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectFee = -50m,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.EstimatedProjectFee)
                .WithErrorMessage("EstimatedProjectFee must be greater than or equal to 0");
        }

        [Fact]
        public async Task Validate_ZeroValues_ShouldNotHaveError()
        {
            // Arrange
            var project = new Project 
            { 
                Id = 1, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m 
            };
            
            _projectRepositoryMock.Setup(r => r.GetById(1))
                .Returns(project);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectCost = 0m,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.EstimatedProjectCost);
        }

        #endregion

        #region Reason Validation

        [Fact]
        public async Task Validate_ReasonExceeds500Characters_ShouldHaveError()
        {
            // Arrange
            var longReason = new string('a', 501);
            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectCost = 100000m,
                ChangedBy = "test@example.com",
                Reason = longReason
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.Reason)
                .WithErrorMessage("Reason cannot exceed 500 characters");
        }

        [Fact]
        public async Task Validate_ReasonExactly500Characters_ShouldNotHaveError()
        {
            // Arrange
            var project = new Project 
            { 
                Id = 1, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m 
            };
            
            _projectRepositoryMock.Setup(r => r.GetById(1))
                .Returns(project);

            var exactReason = new string('a', 500);
            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectCost = 150000m,
                ChangedBy = "test@example.com",
                Reason = exactReason
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.Reason);
        }

        [Fact]
        public async Task Validate_NullReason_ShouldNotHaveError()
        {
            // Arrange
            var project = new Project 
            { 
                Id = 1, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m 
            };
            
            _projectRepositoryMock.Setup(r => r.GetById(1))
                .Returns(project);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectCost = 150000m,
                ChangedBy = "test@example.com",
                Reason = null
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.Reason);
        }

        [Fact]
        public async Task Validate_EmptyReason_ShouldNotHaveError()
        {
            // Arrange
            var project = new Project 
            { 
                Id = 1, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m 
            };
            
            _projectRepositoryMock.Setup(r => r.GetById(1))
                .Returns(project);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectCost = 150000m,
                ChangedBy = "test@example.com",
                Reason = string.Empty
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.Reason);
        }

        #endregion

        #region ChangedBy Validation

        [Fact]
        public async Task Validate_EmptyChangedBy_ShouldHaveError()
        {
            // Arrange
            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectCost = 100000m,
                ChangedBy = string.Empty
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.ChangedBy)
                .WithErrorMessage("ChangedBy is required");
        }

        [Fact]
        public async Task Validate_ChangedByExceeds450Characters_ShouldHaveError()
        {
            // Arrange
            var longChangedBy = new string('a', 451);
            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectCost = 100000m,
                ChangedBy = longChangedBy
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.ChangedBy)
                .WithErrorMessage("ChangedBy cannot exceed 450 characters");
        }

        #endregion

        #region Value Change Validation

        [Fact]
        public async Task Validate_SameValueAsCurrent_ShouldHaveError()
        {
            // Arrange
            var currentValue = 100000m;
            var project = new Project 
            { 
                Id = 1, 
                EstimatedProjectCost = currentValue,
                EstimatedProjectFee = 50000m 
            };
            
            _projectRepositoryMock.Setup(r => r.GetById(1))
                .Returns(project);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectCost = currentValue, // Same value
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x)
                .WithErrorMessage("New values must be different from current values");
        }

        [Fact]
        public async Task Validate_DifferentValueFromCurrent_ShouldNotHaveError()
        {
            // Arrange
            var project = new Project 
            { 
                Id = 1, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m 
            };
            
            _projectRepositoryMock.Setup(r => r.GetById(1))
                .Returns(project);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectCost = 150000m, // Different value
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x);
        }

        #endregion

        #region Decimal Precision Tests

        [Fact]
        public async Task Validate_DecimalWithTwoPlaces_ShouldNotHaveError()
        {
            // Arrange
            var project = new Project 
            { 
                Id = 1, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m 
            };
            
            _projectRepositoryMock.Setup(r => r.GetById(1))
                .Returns(project);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectCost = 123456.78m,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.EstimatedProjectCost);
        }

        [Fact]
        public async Task Validate_VeryLargeDecimal_ShouldNotHaveError()
        {
            // Arrange
            var project = new Project 
            { 
                Id = 1, 
                EstimatedProjectCost = 100000m,
                EstimatedProjectFee = 50000m 
            };
            
            _projectRepositoryMock.Setup(r => r.GetById(1))
                .Returns(project);

            var command = new UpdateProjectBudgetCommand
            {
                ProjectId = 1,
                EstimatedProjectCost = 999999999999999.99m,
                ChangedBy = "test@example.com"
            };

            // Act
            var result = await _validator.TestValidateAsync(command);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.EstimatedProjectCost);
        }

        #endregion
    }
}

