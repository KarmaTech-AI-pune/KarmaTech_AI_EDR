using FluentValidation;
using NJS.Application.CQRS.Correspondence.Commands;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Validation
{
    public class DeleteCorrespondenceOutwardCommandValidatorTests
    {
        private readonly DeleteCorrespondenceOutwardCommandValidator _validator;

        public DeleteCorrespondenceOutwardCommandValidatorTests()
        {
            _validator = new DeleteCorrespondenceOutwardCommandValidator();
        }

        [Fact]
        public async Task Validate_WithValidCommand_ShouldPass()
        {
            // Arrange
            var command = new DeleteCorrespondenceOutwardCommand { Id = 1 };

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
            var command = new DeleteCorrespondenceOutwardCommand { Id = 0 }; // Invalid Id

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
            var command = new DeleteCorrespondenceOutwardCommand { Id = -1 }; // Negative Id

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Id");
        }
    }
}
