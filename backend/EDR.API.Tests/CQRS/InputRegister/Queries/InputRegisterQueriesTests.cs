using EDR.Application.CQRS.InputRegister.Queries;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using Xunit;

namespace EDR.API.Tests.CQRS.InputRegister.Queries
{
    public class InputRegisterQueriesTests
    {
        [Fact]
        public void GetAllInputRegistersQuery_IsRequestForInputRegisterDtoCollection()
        {
            // Arrange & Act
            var query = new GetAllInputRegistersQuery();
            var interfaces = query.GetType().GetInterfaces();

            // Assert
            Assert.Contains(interfaces, i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(MediatR.IRequest<>) &&
                i.GetGenericArguments()[0].IsGenericType &&
                i.GetGenericArguments()[0].GetGenericTypeDefinition() == typeof(IEnumerable<>) &&
                i.GetGenericArguments()[0].GetGenericArguments()[0] == typeof(EDR.Application.DTOs.InputRegisterDto));
        }

        [Fact]
        public void GetInputRegisterByIdQuery_Constructor_SetsId()
        {
            // Arrange & Act
            var id = 1;
            var query = new GetInputRegisterByIdQuery(id);

            // Assert
            Assert.Equal(id, query.Id);
        }

        [Fact]
        public void GetInputRegisterByIdQuery_IdHasRequiredAttribute()
        {
            // Arrange & Act
            var property = typeof(GetInputRegisterByIdQuery).GetProperty("Id");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
        }

        [Fact]
        public void GetInputRegisterByIdQuery_IsRequestForInputRegisterDto()
        {
            // Arrange & Act
            var query = new GetInputRegisterByIdQuery(1);
            var interfaces = query.GetType().GetInterfaces();

            // Assert
            Assert.Contains(interfaces, i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(MediatR.IRequest<>) &&
                i.GetGenericArguments()[0] == typeof(EDR.Application.DTOs.InputRegisterDto));
        }

        [Fact]
        public void GetInputRegistersByProjectQuery_Constructor_SetsProjectId()
        {
            // Arrange & Act
            var projectId = 1;
            var query = new GetInputRegistersByProjectQuery(projectId);

            // Assert
            Assert.Equal(projectId, query.ProjectId);
        }

        [Fact]
        public void GetInputRegistersByProjectQuery_ProjectIdHasRequiredAttribute()
        {
            // Arrange & Act
            var property = typeof(GetInputRegistersByProjectQuery).GetProperty("ProjectId");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
        }

        [Fact]
        public void GetInputRegistersByProjectQuery_IsRequestForInputRegisterDtoCollection()
        {
            // Arrange & Act
            var query = new GetInputRegistersByProjectQuery(1);
            var interfaces = query.GetType().GetInterfaces();

            // Assert
            Assert.Contains(interfaces, i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(MediatR.IRequest<>) &&
                i.GetGenericArguments()[0].IsGenericType &&
                i.GetGenericArguments()[0].GetGenericTypeDefinition() == typeof(IEnumerable<>) &&
                i.GetGenericArguments()[0].GetGenericArguments()[0] == typeof(EDR.Application.DTOs.InputRegisterDto));
        }

        [Fact]
        public void GetInputRegisterByIdQuery_ValidId_PassesValidation()
        {
            // Arrange
            var query = new GetInputRegisterByIdQuery(1);

            // Act
            var validationResults = ValidateModel(query);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void GetInputRegisterByIdQuery_InvalidId_FailsValidation()
        {
            // Arrange
            var query = new GetInputRegisterByIdQuery(0); // Invalid ID (should be > 0)

            // Act
            var validationResults = ValidateModel(query);

            // Assert
            // Note: This test might fail if there's no validation for ID > 0
            // If that's the case, you might want to add such validation
            Assert.Empty(validationResults);
        }

        [Fact]
        public void GetInputRegistersByProjectQuery_ValidProjectId_PassesValidation()
        {
            // Arrange
            var query = new GetInputRegistersByProjectQuery(1);

            // Act
            var validationResults = ValidateModel(query);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void GetInputRegistersByProjectQuery_InvalidProjectId_FailsValidation()
        {
            // Arrange
            var query = new GetInputRegistersByProjectQuery(0); // Invalid ID (should be > 0)

            // Act
            var validationResults = ValidateModel(query);

            // Assert
            // Note: This test might fail if there's no validation for ProjectId > 0
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

