using NJS.Application.CQRS.Correspondence.Queries;
using NJS.Application.DTOs;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace NJS.API.Tests.CQRS.Correspondence.Queries
{
    public class CorrespondenceInwardQueriesTests
    {
        [Fact]
        public void GetAllCorrespondenceInwardsQuery_IsRequestForCorrespondenceInwardDtoCollection()
        {
            // Arrange & Act
            var query = new GetAllCorrespondenceInwardsQuery();
            var interfaces = query.GetType().GetInterfaces();

            // Assert
            Assert.Contains(interfaces, i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(MediatR.IRequest<>) &&
                i.GetGenericArguments()[0].IsGenericType &&
                i.GetGenericArguments()[0].GetGenericTypeDefinition() == typeof(IEnumerable<>) &&
                i.GetGenericArguments()[0].GetGenericArguments()[0] == typeof(CorrespondenceInwardDto));
        }

        [Fact]
        public void GetCorrespondenceInwardByIdQuery_IsRequestForCorrespondenceInwardDto()
        {
            // Arrange & Act
            var query = new GetCorrespondenceInwardByIdQuery { Id = 1 };
            var interfaces = query.GetType().GetInterfaces();

            // Assert
            Assert.Contains(interfaces, i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(MediatR.IRequest<>) &&
                i.GetGenericArguments()[0] == typeof(CorrespondenceInwardDto));
        }

        [Fact]
        public void GetCorrespondenceInwardsByProjectQuery_IsRequestForCorrespondenceInwardDtoCollection()
        {
            // Arrange & Act
            var query = new GetCorrespondenceInwardsByProjectQuery { ProjectId = 1 };
            var interfaces = query.GetType().GetInterfaces();

            // Assert
            Assert.Contains(interfaces, i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(MediatR.IRequest<>) &&
                i.GetGenericArguments()[0].IsGenericType &&
                i.GetGenericArguments()[0].GetGenericTypeDefinition() == typeof(IEnumerable<>) &&
                i.GetGenericArguments()[0].GetGenericArguments()[0] == typeof(CorrespondenceInwardDto));
        }

        [Fact]
        public void GetCorrespondenceInwardByIdQuery_HasIdProperty()
        {
            // Arrange
            var expectedId = 5;

            // Act
            var query = new GetCorrespondenceInwardByIdQuery { Id = expectedId };

            // Assert
            Assert.Equal(expectedId, query.Id);
        }

        [Fact]
        public void GetCorrespondenceInwardsByProjectQuery_HasProjectIdProperty()
        {
            // Arrange
            var expectedProjectId = 10;

            // Act
            var query = new GetCorrespondenceInwardsByProjectQuery { ProjectId = expectedProjectId };

            // Assert
            Assert.Equal(expectedProjectId, query.ProjectId);
        }
    }
}
