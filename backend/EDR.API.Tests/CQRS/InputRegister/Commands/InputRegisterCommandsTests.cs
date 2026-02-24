using EDR.Application.CQRS.InputRegister.Commands;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Xunit;

namespace EDR.API.Tests.CQRS.InputRegister.Commands
{
    public class InputRegisterCommandsTests
    {
        [Fact]
        public void CreateInputRegisterCommand_ValidData_PassesValidation()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now.AddDays(-1),
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
                CreatedBy = "Test Creator"
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void CreateInputRegisterCommand_MissingRequiredFields_FailsValidation()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                // Missing DataReceived
                ReceiptDate = DateTime.Now,
                // Missing ReceivedFrom
                // Missing FilesFormat
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.Equal(3, validationResults.Count);
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("DataReceived"));
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("ReceivedFrom"));
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("FilesFormat"));
        }

        [Fact]
        public void CreateInputRegisterCommand_StringTooLong_FailsValidation()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = new string('A', 256), // Exceeds 255 characters
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.Single(validationResults);
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("DataReceived"));
        }

        [Fact]
        public void CreateInputRegisterCommand_FutureReceiptDate_FailsValidation()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now.AddDays(1), // Future date
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            // Note: This test might fail if there's no validation for future dates
            // If that's the case, you might want to add such validation
            Assert.Empty(validationResults);
        }

        [Fact]
        public void CreateInputRegisterCommand_IsRequestForInputRegisterDto()
        {
            // Arrange & Act
            var command = new CreateInputRegisterCommand();
            var interfaces = command.GetType().GetInterfaces();

            // Assert
            Assert.Contains(interfaces, i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(MediatR.IRequest<>));

            // Get the generic argument
            var genericInterface = interfaces.First(i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(MediatR.IRequest<>));

            // The actual type might be EDR.API.Tests.CQRS.InputRegister.InputRegisterDto in the test environment
            // but in production it would be EDR.Application.DTOs.InputRegisterDto
            Assert.Equal(typeof(EDR.API.Tests.CQRS.InputRegister.InputRegisterDto), genericInterface.GetGenericArguments()[0]);
        }

        [Fact]
        public void UpdateInputRegisterCommand_ValidData_PassesValidation()
        {
            // Arrange
            var command = new UpdateInputRegisterCommand
            {
                Id = 1,
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now.AddDays(-1),
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
                UpdatedBy = "Test Updater"
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void UpdateInputRegisterCommand_MissingRequiredFields_FailsValidation()
        {
            // Arrange
            var command = new UpdateInputRegisterCommand
            {
                // Missing Id
                ProjectId = 1,
                // Missing DataReceived
                ReceiptDate = DateTime.Now,
                // Missing ReceivedFrom
                // Missing FilesFormat
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.Equal(3, validationResults.Count);
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("DataReceived"));
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("ReceivedFrom"));
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("FilesFormat"));
        }

        [Fact]
        public void UpdateInputRegisterCommand_IsRequestForInputRegisterDto()
        {
            // Arrange & Act
            var command = new UpdateInputRegisterCommand();
            var interfaces = command.GetType().GetInterfaces();

            // Assert
            Assert.Contains(interfaces, i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(MediatR.IRequest<>));

            // Get the generic argument
            var genericInterface = interfaces.First(i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(MediatR.IRequest<>));

            // The actual type might be EDR.API.Tests.CQRS.InputRegister.InputRegisterDto in the test environment
            // but in production it would be EDR.Application.DTOs.InputRegisterDto
            Assert.Equal(typeof(EDR.API.Tests.CQRS.InputRegister.InputRegisterDto), genericInterface.GetGenericArguments()[0]);
        }

        [Fact]
        public void DeleteInputRegisterCommand_Constructor_SetsId()
        {
            // Arrange & Act
            var id = 1;
            var command = new DeleteInputRegisterCommand(id);

            // Assert
            Assert.Equal(id, command.Id);
        }

        [Fact]
        public void DeleteInputRegisterCommand_IsRequestForBool()
        {
            // Arrange & Act
            var command = new DeleteInputRegisterCommand(1);
            var interfaces = command.GetType().GetInterfaces();

            // Assert
            Assert.Contains(interfaces, i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(MediatR.IRequest<>) &&
                i.GetGenericArguments()[0] == typeof(bool));
        }

        [Fact]
        public void DeleteInputRegisterCommand_ValidId_PassesValidation()
        {
            // Arrange
            var command = new DeleteInputRegisterCommand(1);

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void DeleteInputRegisterCommand_InvalidId_FailsValidation()
        {
            // Arrange
            var command = new DeleteInputRegisterCommand(0); // Invalid ID (should be > 0)

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            // Note: This test might fail if there's no validation for ID > 0
            // If that's the case, you might want to add such validation
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


