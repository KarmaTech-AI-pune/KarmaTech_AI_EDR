using NJS.Domain.Entities;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;
using Xunit;

namespace NJS.API.Tests.Entities
{
    public class CorrespondenceOutwardEntityTests
    {
        [Fact]
        public void CorrespondenceOutward_HasTableAttribute()
        {
            // Arrange & Act
            var tableAttribute = typeof(CorrespondenceOutward).GetCustomAttribute<TableAttribute>();

            // Assert
            Assert.NotNull(tableAttribute);
            Assert.Equal("CorrespondenceOutwards", tableAttribute.Name);
        }

        [Fact]
        public void CorrespondenceOutward_IdHasKeyAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceOutward).GetProperty("Id");
            var keyAttribute = property.GetCustomAttribute<KeyAttribute>();

            // Assert
            Assert.NotNull(keyAttribute);
        }

        [Fact]
        public void CorrespondenceOutward_ProjectIdHasRequiredAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceOutward).GetProperty("ProjectId");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
        }

        [Fact]
        public void CorrespondenceOutward_ProjectIdHasForeignKeyAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceOutward).GetProperty("Project");
            var foreignKeyAttribute = property.GetCustomAttribute<ForeignKeyAttribute>();

            // Assert
            Assert.NotNull(foreignKeyAttribute);
            Assert.Equal("ProjectId", foreignKeyAttribute.Name);
        }

        [Fact]
        public void CorrespondenceOutward_LetterNoHasRequiredAndStringLengthAttributes()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceOutward).GetProperty("LetterNo");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(255, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceOutward_LetterDateHasRequiredAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceOutward).GetProperty("LetterDate");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
        }

        [Fact]
        public void CorrespondenceOutward_ToHasRequiredAndStringLengthAttributes()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceOutward).GetProperty("To");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(255, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceOutward_SubjectHasRequiredAndStringLengthAttributes()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceOutward).GetProperty("Subject");
            var requiredAttribute = property.GetCustomAttribute<RequiredAttribute>();
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(requiredAttribute);
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(500, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceOutward_AttachmentDetailsHasStringLengthAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceOutward).GetProperty("AttachmentDetails");
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(500, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceOutward_ActionTakenHasStringLengthAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceOutward).GetProperty("ActionTaken");
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(500, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceOutward_StoragePathHasStringLengthAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceOutward).GetProperty("StoragePath");
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(500, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceOutward_RemarksHasStringLengthAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceOutward).GetProperty("Remarks");
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(1000, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceOutward_AcknowledgementHasStringLengthAttribute()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceOutward).GetProperty("Acknowledgement");
            var stringLengthAttribute = property.GetCustomAttribute<StringLengthAttribute>();

            // Assert
            Assert.NotNull(stringLengthAttribute);
            Assert.Equal(255, stringLengthAttribute.MaximumLength);
        }

        [Fact]
        public void CorrespondenceOutward_CreatedByProperty_Exists()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceOutward).GetProperty("CreatedBy");

            // Assert
            Assert.NotNull(property);
            Assert.Equal(typeof(string), property.PropertyType);
        }

        [Fact]
        public void CorrespondenceOutward_UpdatedByProperty_Exists()
        {
            // Arrange & Act
            var property = typeof(CorrespondenceOutward).GetProperty("UpdatedBy");

            // Assert
            Assert.NotNull(property);
            Assert.Equal(typeof(string), property.PropertyType);
        }
    }
}
