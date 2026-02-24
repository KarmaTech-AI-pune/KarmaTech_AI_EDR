using EDR.Application.CQRS.Correspondence.Queries;
using EDR.Application.DTOs;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace EDR.API.Tests.CQRS.Correspondence.Queries
{
    public class CorrespondenceOutwardQueriesTests
    {
        [Fact]
        public void GetAllCorrespondenceOutwardsQuery_IsRequestForCorrespondenceOutwardDtoCollection()
        {
            // Arrange & Act
            var query = new GetAllCorrespondenceOutwardsQuery();
            var interfaces = query.GetType().GetInterfaces();

            // Assert
            Assert.Contains(interfaces, i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(MediatR.IRequest<>) &&
                i.GetGenericArguments()[0].IsGenericType &&
                i.GetGenericArguments()[0].GetGenericTypeDefinition() == typeof(IEnumerable<>) &&
                i.GetGenericArguments()[0].GetGenericArguments()[0] == typeof(CorrespondenceOutwardDto));
        }

        [Fact]
        public void GetCorrespondenceOutwardByIdQuery_IsRequestForCorrespondenceOutwardDto()
        {
            // Arrange & Act
            var query = new GetCorrespondenceOutwardByIdQuery { Id = 1 };
            var interfaces = query.GetType().GetInterfaces();

            // Assert
            Assert.Contains(interfaces, i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(MediatR.IRequest<>) &&
                i.GetGenericArguments()[0] == typeof(CorrespondenceOutwardDto));
        }

        [Fact]
        public void GetCorrespondenceOutwardsByProjectQuery_IsRequestForCorrespondenceOutwardDtoCollection()
        {
            // Arrange & Act
            var query = new GetCorrespondenceOutwardsByProjectQuery { ProjectId = 1 };
            var interfaces = query.GetType().GetInterfaces();

            // Assert
            Assert.Contains(interfaces, i =>
                i.IsGenericType &&
                i.GetGenericTypeDefinition() == typeof(MediatR.IRequest<>) &&
                i.GetGenericArguments()[0].IsGenericType &&
                i.GetGenericArguments()[0].GetGenericTypeDefinition() == typeof(IEnumerable<>) &&
                i.GetGenericArguments()[0].GetGenericArguments()[0] == typeof(CorrespondenceOutwardDto));
        }

        [Fact]
        public void GetCorrespondenceOutwardByIdQuery_HasIdProperty()
        {
            // Arrange
            var expectedId = 5;

            // Act
            var query = new GetCorrespondenceOutwardByIdQuery { Id = expectedId };

            // Assert
            Assert.Equal(expectedId, query.Id);
        }

        [Fact]
        public void GetCorrespondenceOutwardsByProjectQuery_HasProjectIdProperty()
        {
            // Arrange
            var expectedProjectId = 10;

            // Act
            var query = new GetCorrespondenceOutwardsByProjectQuery { ProjectId = expectedProjectId };

            // Assert
            Assert.Equal(expectedProjectId, query.ProjectId);
        }
    }
}

