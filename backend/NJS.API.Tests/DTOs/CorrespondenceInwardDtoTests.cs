using NJS.Application.DTOs;
using System.ComponentModel.DataAnnotations;

namespace NJS.API.Tests.DTOs
{
    public class CorrespondenceInwardDtoTests
    {
        [Fact]
        public void CorrespondenceInwardDto_ValidData_PassesValidation()
        {
            // Arrange
            var dto = new CorrespondenceInwardDto
            {
                Id = 1,
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                AttachmentDetails = "Population_Projection_2045.pdf",
                ActionTaken = "Forwarded to Design Team for STP Capacity Review",
                StoragePath = "/documents/inward/2024/001",
                Remarks = "Urgent review required for capacity enhancement",
                RepliedDate = DateTime.Now.AddDays(-1),
                CreatedBy = "Test Creator",
                CreatedAt = DateTime.Now.AddDays(-1),
                UpdatedBy = "Test Updater",
                UpdatedAt = DateTime.Now
            };

            // Act
            var validationResults = ValidateModel(dto);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void CorrespondenceInwardDto_HasAllRequiredProperties()
        {
            // Arrange
            var expectedProperties = new List<string>
            {
                "Id", "ProjectId", "IncomingLetterNo", "LetterDate", "NjsInwardNo",
                "ReceiptDate", "From", "Subject", "AttachmentDetails", "ActionTaken",
                "StoragePath", "Remarks", "RepliedDate", "CreatedAt", "UpdatedAt",
                "CreatedBy", "UpdatedBy"
            };

            // Act
            var actualProperties = typeof(CorrespondenceInwardDto).GetProperties();

            // Assert
            foreach (var expectedProperty in expectedProperties)
            {
                Assert.Contains(actualProperties, p => p.Name == expectedProperty);
            }
        }

        [Fact]
        public void CorrespondenceInwardDto_PropertiesHaveCorrectTypes()
        {
            // Arrange & Act
            var idProperty = typeof(CorrespondenceInwardDto).GetProperty("Id");
            var projectIdProperty = typeof(CorrespondenceInwardDto).GetProperty("ProjectId");
            var incomingLetterNoProperty = typeof(CorrespondenceInwardDto).GetProperty("IncomingLetterNo");
            var letterDateProperty = typeof(CorrespondenceInwardDto).GetProperty("LetterDate");
            var njsInwardNoProperty = typeof(CorrespondenceInwardDto).GetProperty("NjsInwardNo");
            var receiptDateProperty = typeof(CorrespondenceInwardDto).GetProperty("ReceiptDate");
            var fromProperty = typeof(CorrespondenceInwardDto).GetProperty("From");
            var subjectProperty = typeof(CorrespondenceInwardDto).GetProperty("Subject");
            var repliedDateProperty = typeof(CorrespondenceInwardDto).GetProperty("RepliedDate");
            var createdAtProperty = typeof(CorrespondenceInwardDto).GetProperty("CreatedAt");
            var updatedAtProperty = typeof(CorrespondenceInwardDto).GetProperty("UpdatedAt");

            // Assert
            Assert.Equal(typeof(int), idProperty.PropertyType);
            Assert.Equal(typeof(int), projectIdProperty.PropertyType);
            Assert.Equal(typeof(string), incomingLetterNoProperty.PropertyType);
            Assert.Equal(typeof(DateTime), letterDateProperty.PropertyType);
            Assert.Equal(typeof(string), njsInwardNoProperty.PropertyType);
            Assert.Equal(typeof(DateTime), receiptDateProperty.PropertyType);
            Assert.Equal(typeof(string), fromProperty.PropertyType);
            Assert.Equal(typeof(string), subjectProperty.PropertyType);
            Assert.Equal(typeof(DateTime?), repliedDateProperty.PropertyType);
            Assert.Equal(typeof(DateTime), createdAtProperty.PropertyType);
            Assert.Equal(typeof(DateTime?), updatedAtProperty.PropertyType);
        }

        private IList<ValidationResult> ValidateModel(object model)
        {
            var validationResults = new List<ValidationResult>();
            var ctx = new ValidationContext(model, null, null);
            Validator.TryValidateObject(model, ctx, validationResults, true);
            return validationResults;
        }
    }
}
