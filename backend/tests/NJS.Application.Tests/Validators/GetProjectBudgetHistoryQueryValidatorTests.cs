using FluentValidation.TestHelper;
using NJS.Application.CQRS.Projects.Queries;
using NJS.Application.CQRS.Projects.Validators;
using Xunit;

namespace NJS.Application.Tests.Validators
{
    public class GetProjectBudgetHistoryQueryValidatorTests
    {
        private readonly GetProjectBudgetHistoryQueryValidator _validator;

        public GetProjectBudgetHistoryQueryValidatorTests()
        {
            _validator = new GetProjectBudgetHistoryQueryValidator();
        }

        #region ProjectId Validation

        [Fact]
        public void Validate_ProjectIdZero_ShouldHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 0,
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.ProjectId)
                .WithErrorMessage("ProjectId must be greater than 0");
        }

        [Fact]
        public void Validate_ProjectIdNegative_ShouldHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = -1,
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.ProjectId);
        }

        [Fact]
        public void Validate_ProjectIdPositive_ShouldNotHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.ProjectId);
        }

        #endregion

        #region FieldName Validation

        [Fact]
        public void Validate_FieldNameEstimatedProjectCost_ShouldNotHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                FieldName = "EstimatedProjectCost",
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.FieldName);
        }

        [Fact]
        public void Validate_FieldNameEstimatedProjectFee_ShouldNotHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                FieldName = "EstimatedProjectFee",
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.FieldName);
        }

        [Fact]
        public void Validate_FieldNameInvalid_ShouldHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                FieldName = "InvalidFieldName",
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.FieldName)
                .WithErrorMessage("FieldName must be either 'EstimatedProjectCost' or 'EstimatedProjectFee'");
        }

        [Fact]
        public void Validate_FieldNameNull_ShouldNotHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                FieldName = null,
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.FieldName);
        }

        [Fact]
        public void Validate_FieldNameEmpty_ShouldNotHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                FieldName = string.Empty,
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.FieldName);
        }

        #endregion

        #region PageNumber Validation

        [Fact]
        public void Validate_PageNumberZero_ShouldHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                PageNumber = 0,
                PageSize = 10
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.PageNumber)
                .WithErrorMessage("PageNumber must be greater than 0");
        }

        [Fact]
        public void Validate_PageNumberNegative_ShouldHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                PageNumber = -1,
                PageSize = 10
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.PageNumber);
        }

        [Fact]
        public void Validate_PageNumberPositive_ShouldNotHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.PageNumber);
        }

        #endregion

        #region PageSize Validation

        [Fact]
        public void Validate_PageSizeZero_ShouldHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                PageNumber = 1,
                PageSize = 0
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.PageSize);
        }

        [Fact]
        public void Validate_PageSizeNegative_ShouldHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                PageNumber = 1,
                PageSize = -1
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.PageSize);
        }

        [Fact]
        public void Validate_PageSizeExceeds100_ShouldHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                PageNumber = 1,
                PageSize = 101
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldHaveValidationErrorFor(x => x.PageSize)
                .WithErrorMessage("PageSize must be between 1 and 100");
        }

        [Fact]
        public void Validate_PageSizeExactly100_ShouldNotHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                PageNumber = 1,
                PageSize = 100
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.PageSize);
        }

        [Fact]
        public void Validate_PageSizeOne_ShouldNotHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                PageNumber = 1,
                PageSize = 1
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.PageSize);
        }

        [Fact]
        public void Validate_PageSizeValid_ShouldNotHaveError()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                PageNumber = 1,
                PageSize = 50
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldNotHaveValidationErrorFor(x => x.PageSize);
        }

        #endregion

        #region Complete Valid Query

        [Fact]
        public void Validate_CompleteValidQuery_ShouldNotHaveAnyErrors()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                FieldName = "EstimatedProjectCost",
                PageNumber = 2,
                PageSize = 25
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Fact]
        public void Validate_MinimalValidQuery_ShouldNotHaveAnyErrors()
        {
            // Arrange
            var query = new GetProjectBudgetHistoryQuery
            {
                ProjectId = 1,
                PageNumber = 1,
                PageSize = 10
            };

            // Act
            var result = _validator.TestValidate(query);

            // Assert
            result.ShouldNotHaveAnyValidationErrors();
        }

        #endregion
    }
}
