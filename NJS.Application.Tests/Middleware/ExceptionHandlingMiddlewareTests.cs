using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace NJS.Application.Tests.Middleware
{
    public class ExceptionHandlingMiddlewareTests
    {
        [Fact]
        public async Task InvokeAsync_NoException_CallsNextDelegate()
        {
            // Arrange
            var context = new DefaultHttpContext();
            var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            var nextDelegateCalled = false;
            RequestDelegate next = (HttpContext ctx) =>
            {
                nextDelegateCalled = true;
                return Task.CompletedTask;
            };

            var middleware = new ExceptionHandlingMiddleware(next);

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.True(nextDelegateCalled);
            Assert.Equal(200, context.Response.StatusCode);
        }

        [Fact]
        public async Task InvokeAsync_ArgumentException_ReturnsBadRequest()
        {
            // Arrange
            var context = new DefaultHttpContext();
            var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            var exceptionMessage = "Invalid argument";
            RequestDelegate next = (HttpContext ctx) =>
            {
                throw new ArgumentException(exceptionMessage);
            };

            var middleware = new ExceptionHandlingMiddleware(next);

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.Equal((int)HttpStatusCode.BadRequest, context.Response.StatusCode);
            Assert.Equal("application/json", context.Response.ContentType);

            responseBody.Seek(0, SeekOrigin.Begin);
            var responseText = await new StreamReader(responseBody).ReadToEndAsync();
            var response = JsonSerializer.Deserialize<JsonElement>(responseText);

            Assert.Equal("BadRequest", response.GetProperty("status").GetString());
            Assert.Equal(exceptionMessage, response.GetProperty("message").GetString());
        }

        [Fact]
        public async Task InvokeAsync_InvalidOperationException_ReturnsBadRequest()
        {
            // Arrange
            var context = new DefaultHttpContext();
            var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            var exceptionMessage = "Invalid operation";
            RequestDelegate next = (HttpContext ctx) =>
            {
                throw new InvalidOperationException(exceptionMessage);
            };

            var middleware = new ExceptionHandlingMiddleware(next);

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.Equal((int)HttpStatusCode.BadRequest, context.Response.StatusCode);
            Assert.Equal("application/json", context.Response.ContentType);

            responseBody.Seek(0, SeekOrigin.Begin);
            var responseText = await new StreamReader(responseBody).ReadToEndAsync();
            var response = JsonSerializer.Deserialize<JsonElement>(responseText);

            Assert.Equal("BadRequest", response.GetProperty("status").GetString());
            Assert.Equal(exceptionMessage, response.GetProperty("message").GetString());
        }

        [Fact]
        public async Task InvokeAsync_UnauthorizedAccessException_ReturnsUnauthorized()
        {
            // Arrange
            var context = new DefaultHttpContext();
            var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            var exceptionMessage = "Unauthorized access";
            RequestDelegate next = (HttpContext ctx) =>
            {
                throw new UnauthorizedAccessException(exceptionMessage);
            };

            var middleware = new ExceptionHandlingMiddleware(next);

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.Equal((int)HttpStatusCode.Unauthorized, context.Response.StatusCode);
            Assert.Equal("application/json", context.Response.ContentType);

            responseBody.Seek(0, SeekOrigin.Begin);
            var responseText = await new StreamReader(responseBody).ReadToEndAsync();
            var response = JsonSerializer.Deserialize<JsonElement>(responseText);

            Assert.Equal("Unauthorized", response.GetProperty("status").GetString());
            Assert.Equal(exceptionMessage, response.GetProperty("message").GetString());
        }

        [Fact]
        public async Task InvokeAsync_GenericException_ReturnsInternalServerError()
        {
            // Arrange
            var context = new DefaultHttpContext();
            var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            var exceptionMessage = "Something went wrong";
            RequestDelegate next = (HttpContext ctx) =>
            {
                throw new Exception(exceptionMessage);
            };

            var middleware = new ExceptionHandlingMiddleware(next);

            // Act
            await middleware.InvokeAsync(context);

            // Assert
            Assert.Equal((int)HttpStatusCode.InternalServerError, context.Response.StatusCode);
            Assert.Equal("application/json", context.Response.ContentType);

            responseBody.Seek(0, SeekOrigin.Begin);
            var responseText = await new StreamReader(responseBody).ReadToEndAsync();
            var response = JsonSerializer.Deserialize<JsonElement>(responseText);

            Assert.Equal("InternalServerError", response.GetProperty("status").GetString());
            Assert.Equal(exceptionMessage, response.GetProperty("message").GetString());
        }
    }
}
