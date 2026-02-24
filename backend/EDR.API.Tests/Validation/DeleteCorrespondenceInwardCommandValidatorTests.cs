using FluentValidation;
using EDR.Application.CQRS.Correspondence.Commands;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Validation
{
    public class DeleteCorrespondenceInwardCommandValidatorTests
    {
        private readonly DeleteCorrespondenceInwardCommandValidator _validator;

        public DeleteCorrespondenceInwardCommandValidatorTests()
        {
            _validator = new DeleteCorrespondenceInwardCommandValidator();
        }

        [Fact]
        public async Task Validate_WithValidCommand_ShouldPass()
        {
            // Arrange
            var command = new DeleteCorrespondenceInwardCommand { Id = 1 };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task Validate_WithInvalidId_ShouldFail()
        {
            // Arrange
            var command = new DeleteCorrespondenceInwardCommand { Id = 0 }; // Invalid Id

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Id");
        }

        [Fact]
        public async Task Validate_WithNegativeId_ShouldFail()
        {
            // Arrange
            var command = new DeleteCorrespondenceInwardCommand { Id = -1 }; // Negative Id

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Id");
        }
    }
}

