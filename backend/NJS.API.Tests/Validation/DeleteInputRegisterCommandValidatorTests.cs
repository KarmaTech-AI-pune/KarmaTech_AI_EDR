using FluentValidation;
using NJS.Application.CQRS.InputRegister.Commands;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Validation
{
    public class DeleteInputRegisterCommandValidatorTests
    {
        private readonly DeleteInputRegisterCommandValidator _validator;

        public DeleteInputRegisterCommandValidatorTests()
        {
            _validator = new DeleteInputRegisterCommandValidator();
        }

        [Fact]
        public async Task Validate_WithValidCommand_ShouldPass()
        {
            // Arrange
            var command = new DeleteInputRegisterCommand(1);

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Theory]
        [InlineData(0, "Invalid Id")]
        [InlineData(-1, "Invalid Id")]
        public async Task Validate_WithInvalidId_ShouldFail(int id, string expectedError)
        {
            // Arrange
            var command = new DeleteInputRegisterCommand(id);

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage.Contains(expectedError));
        }
    }
}
