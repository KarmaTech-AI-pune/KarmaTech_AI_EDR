using NJS.Domain.Entities;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;
using Xunit;

namespace NJS.API.Tests.Entities
{
    public class CorrespondenceInwardEntityTests
    {
        [Fact]
        public void CorrespondenceInward_HasTableAttribute()
        {
            // Arrange & Act
            var tableAttribute = typeof(CorrespondenceInward).GetCustomAttribute<TableAttribute>();

            // Assert
            Assert.NotNull(tableAttribute);
            Assert.Equal("CorrespondenceInwards", tableAttribute.Name);
        }

        [Fact]
        public void CorrespondenceInward_IdHasKeyAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("Id");
            var keyAttribute = property.GetCustomAttribute<KeyAttribute>();

            // Assert
            Assert.NotNull(keyAttribute);
        }

        [Fact]
        public void CorrespondenceInward_ProjectIdHasRequiredAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("ProjectId");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
        }

        [Fact]
        public void CorrespondenceInward_ProjectIdHasForeignKeyAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("Project");
            var foreignKeyAttribute = property.GetCustomAttribute<ForeignKeyAttribute>();

            // Assert
            Assert.NotNull(foreignKeyAttribute);
            Assert.Equal("ProjectId", foreignKeyAttribute.Name);
        }

        [Fact]
        public void CorrespondenceInward_IncomingLetterNoHasRequiredAndStringLengthAttributes()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("IncomingLetterNo");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(255, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceInward_LetterDateHasRequiredAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("LetterDate");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
        }

        [Fact]
        public void CorrespondenceInward_NjsInwardNoHasRequiredAndStringLengthAttributes()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("NjsInwardNo");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(255, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceInward_ReceiptDateHasRequiredAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("ReceiptDate");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
        }

        [Fact]
        public void CorrespondenceInward_FromHasRequiredAndStringLengthAttributes()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("From");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(255, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceInward_SubjectHasRequiredAndStringLengthAttributes()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("Subject");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(500, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceInward_AttachmentDetailsHasStringLengthAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("AttachmentDetails");
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(500, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceInward_ActionTakenHasStringLengthAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("ActionTaken");
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(500, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceInward_StoragePathHasStringLengthAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("StoragePath");
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(500, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceInward_RemarksHasStringLengthAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("Remarks");
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(1000, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceInward_CreatedByProperty_Exists()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("CreatedBy");

            // Assert
            Assert.NotNull(property);
            Assert.Equal(typeof(string), property.PropertyType);
        }

        [Fact]
        public void CorrespondenceInward_UpdatedByProperty_Exists()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceInward).GetProperty("UpdatedBy");

            // Assert
            Assert.NotNull(property);
            Assert.Equal(typeof(string), property.PropertyType);
        }
    }
}
