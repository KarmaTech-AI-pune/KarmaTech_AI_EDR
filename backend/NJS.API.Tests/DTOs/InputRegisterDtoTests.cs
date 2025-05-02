using NJS.Application.DTOs;
using System.ComponentModel.DataAnnotations;

namespace NJS.API.Tests.DTOs
{
    public class InputRegisterDtoTests
    {
        [Fact]
        public void InputRegisterDto_ValidData_PassesValidation()
        {
            // Arrange
            var dto = new InputRegisterDto
            {
                Id = 1,
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CheckedBy = "Test Checker",
                CheckedDate = DateTime.Now,
                Custodian = "Test Custodian",
                StoragePath = "/test/path",
                Remarks = "Test Remarks",
                CreatedBy = "Test Creator",
                CreatedAt = DateTime.Now,
                UpdatedBy = "Test Updater",
                UpdatedAt = DateTime.Now
            };

            // Act
            var validationResults = ValidateModel(dto);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void InputRegisterDto_MissingRequiredFields_FailsValidation()
        {
            // Arrange
            var dto = new InputRegisterDto
            {
                Id = 1,
                ProjectId = 1,              
                ReceiptDate = DateTime.Now,               
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var validationResults = ValidateModel(dto);

            // Assert
            Assert.Equal(3, validationResults.Count);
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("DataReceived"));
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("ReceivedFrom"));
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("FilesFormat"));
        }

        [Fact]
        public void InputRegisterDto_StringTooLong_FailsValidation()
        {
            // Arrange
            var dto = new InputRegisterDto
            {
                Id = 1,
                ProjectId = 1,
                DataReceived = new string('A', 256), 
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var validationResults = ValidateModel(dto);

            // Assert
            Assert.Single(validationResults);
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("DataReceived"));
        }

        [Fact]
        public void InputRegisterDto_OptionalFieldsNull_PassesValidation()
        {
            // Arrange
            var dto = new InputRegisterDto
            {
                Id = 1,
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,               
                CheckedBy = null,
                CheckedDate = null,
                Custodian = null,
                StoragePath = null,
                Remarks = null,
                CreatedBy = "Test Creator",
                CreatedAt = DateTime.Now,
                UpdatedBy = null,
                UpdatedAt = null
            };

            // Act
            var validationResults = ValidateModel(dto);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void InputRegisterDto_MaxLengthStrings_PassesValidation()
        {
            // Arrange
            var dto = new InputRegisterDto
            {
                Id = 1,
                ProjectId = 1,
                DataReceived = new string('A', 255),
                ReceiptDate = DateTime.Now,
                ReceivedFrom = new string('B', 255),
                FilesFormat = new string('C', 100), 
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CheckedBy = new string('D', 255), 
                CheckedDate = DateTime.Now,
                Custodian = new string('E', 255), 
                StoragePath = new string('F', 500), 
                Remarks = new string('G', 1000), 
                CreatedBy = "Test Creator",
                CreatedAt = DateTime.Now
            };

            // Act
            var validationResults = ValidateModel(dto);

            // Assert
            Assert.Empty(validationResults);
        }

        private IList<ValidationResult> ValidateModel(object model)
        {
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(model);
            Validator.TryValidateObject(model, validationContext, validationResults, true);
            return validationResults;
        }
    }
}
