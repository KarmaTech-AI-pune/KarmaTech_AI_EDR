using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response = new
            {
                status = context.Response.StatusCode,
                message = "Internal Server Error",
                detailedMessage = exception.Message,
                stackTrace = exception.StackTrace
            };

            var json = JsonSerializer.Serialize(response);
            return context.Response.WriteAsync(json);
        }
    }

    public class ExceptionHandlingMiddlewareTests
    {
        private readonly TestServer _server;
        private readonly HttpClient _client;

        public ExceptionHandlingMiddlewareTests()
        {
            // Create a test server with a custom startup class that registers the exception handling middleware
            var hostBuilder = new HostBuilder()
                .ConfigureWebHost(webHost =>
                {
                    webHost.UseTestServer();
                    webHost.ConfigureServices(services =>
                    {
                        services.AddLogging();
                        services.AddRouting();
                        services.AddControllers();
                    });

                    webHost.Configure(app =>
                    {
                        app.UseMiddleware<ExceptionHandlingMiddleware>();
                        app.UseRouting();
                        app.UseEndpoints(endpoints =>
                        {
                            endpoints.MapGet("/normal", context =>
                            {
                                context.Response.StatusCode = (int)HttpStatusCode.OK;
                                return Task.CompletedTask;
                            });

                            endpoints.MapGet("/error", context =>
                            {
                                throw new Exception("Test exception");
                            });
                        });
                    });
                });

            var host = hostBuilder.Start();
            _server = host.GetTestServer();
            _client = _server.CreateClient();
        }

        [Fact]
        public async Task ExceptionHandlingMiddleware_NormalRequest_ShouldReturnOk()
        {
            // Act
            var response = await _client.GetAsync("/normal");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task ExceptionHandlingMiddleware_ExceptionThrown_ShouldReturnInternalServerError()
        {
            // Act
            var response = await _client.GetAsync("/error");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
            Assert.Equal("application/json", response.Content.Headers.ContentType.MediaType);
            
            var content = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonSerializer.Deserialize<JsonElement>(content);
            
            Assert.Equal(500, errorResponse.GetProperty("status").GetInt32());
            Assert.Equal("Internal Server Error", errorResponse.GetProperty("message").GetString());
            Assert.Equal("Test exception", errorResponse.GetProperty("detailedMessage").GetString());
            Assert.True(errorResponse.TryGetProperty("stackTrace", out _));
        }
    }
}

