using EDR.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection;
using Xunit;

namespace EDR.API.Tests.Entities
{
    public class InputRegisterEntityTests
    {
        [Fact]
        public void InputRegister_HasTableAttribute()
        {
            // Arrange & Act
            var tableAttribute = typeof(InputRegister).GetCustomAttribute<TableAttribute>();

            // Assert
            Assert.NotNull(tableAttribute);
            Assert.Equal("InputRegisters", tableAttribute.Name);
        }

        [Fact]
        public void InputRegister_IdHasKeyAttribute()
        {
            // Arrange & Act
            var property = typeof(InputRegister).GetProperty("Id");
            var keyAttribute = property.GetCustomAttribute<KeyAttribute>();

            // Assert
            Assert.NotNull(keyAttribute);
        }

        [Fact]
        public void InputRegister_ProjectIdHasRequiredAttribute()
        {
            // Arrange & Act
            var property = typeof(InputRegister).GetProperty("ProjectId");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
        }

        [Fact]
        public void InputRegister_ProjectIdHasForeignKeyAttribute()
        {
            // Arrange & Act
            var property = typeof(InputRegister).GetProperty("Project");
            var foreignKeyAttribute = property.GetCustomAttribute<ForeignKeyAttribute>();

            // Assert
            Assert.NotNull(foreignKeyAttribute);
            Assert.Equal("ProjectId", foreignKeyAttribute.Name);
        }

        [Fact]
        public void InputRegister_RequiredPropertiesHaveRequiredAttribute()
        {
            // Arrange
            var requiredProperties = new[]
            {
                "ProjectId",
                "DataReceived",
                "ReceiptDate",
                "ReceivedFrom",
                "FilesFormat",
                "NoOfFiles",
                "FitForPurpose",
                "Check"
            };

            // Act & Assert
            foreach (var propertyName in requiredProperties)
            {
                var property = typeof(InputRegister).GetProperty(propertyName);
                var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();
                Assert.NotNull(requiredAttribute);
            }
        }

        [Fact]
        public void InputRegister_StringPropertiesHaveStringLengthAttribute()
        {
            // Arrange
            var stringProperties = new Dictionary<string, int>
            {
                { "DataReceived", 255 },
                { "ReceivedFrom", 255 },
                { "FilesFormat", 100 },
                { "CheckedBy", 255 },
                { "Custodian", 255 },
                { "StoragePath", 500 },
                { "Remarks", 1000 },
                { "CreatedBy", 0 }, // No StringLength attribute expected
                { "UpdatedBy", 0 }  // No StringLength attribute expected
            };

            // Act & Assert
            foreach (var kvp in stringProperties)
            {
                var property = typeof(InputRegister).GetProperty(kvp.Key);
                var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

                if (kvp.Value > 0)
                {
                    Assert.NotNull(stringLengthAttribute);
                    Assert.Equal(kvp.Value, stringLengthAttribute.MaximumLength);
                }
                else
                {
                    // For properties that don't need StringLength attribute
                    // We don't assert anything specific
                }
            }
        }

        [Fact]
        public void InputRegister_ValidData_PassesValidation()
        {
            // Arrange
            var inputRegister = new InputRegister
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
            var validationResults = ValidateModel(inputRegister);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void InputRegister_MissingRequiredFields_FailsValidation()
        {
            // Arrange
            var inputRegister = new InputRegister
            {
                Id = 1,
                // Missing ProjectId
                // Missing DataReceived
                ReceiptDate = DateTime.Now,
                // Missing ReceivedFrom
                // Missing FilesFormat
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var validationResults = ValidateModel(inputRegister);

            // Assert
            Assert.Equal(3, validationResults.Count);
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("DataReceived"));
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("ReceivedFrom"));
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("FilesFormat"));
        }

        [Fact]
        public void InputRegister_StringTooLong_FailsValidation()
        {
            // Arrange
            var inputRegister = new InputRegister
            {
                Id = 1,
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
            var validationResults = ValidateModel(inputRegister);

            // Assert
            Assert.Single(validationResults);
            Assert.Contains(validationResults, vr => vr.MemberNames.Contains("DataReceived"));
        }

        [Fact]
        public void InputRegister_DefaultCreatedAt_IsUtcNow()
        {
            // Arrange
            var beforeCreate = DateTime.UtcNow.AddSeconds(-1);

            // Act
            var inputRegister = new InputRegister();
            var afterCreate = DateTime.UtcNow.AddSeconds(1);

            // Assert
            Assert.True(inputRegister.CreatedAt >= beforeCreate);
            Assert.True(inputRegister.CreatedAt <= afterCreate);
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

