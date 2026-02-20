using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Middleware
{
    public class CorsMiddlewareTests
    {
        private readonly TestServer _server;
        private readonly HttpClient _client;

        public CorsMiddlewareTests()
        {
            // Create a test server with a custom startup class that only registers CORS
            var hostBuilder = new HostBuilder()
                .ConfigureWebHost(webHost =>
                {
                    webHost.UseTestServer();
                    webHost.ConfigureServices(services =>
                    {
                        services.AddCors(options =>
                        {
                            options.AddPolicy("TestCorsPolicy",
                                builder => builder
                                    .WithOrigins("http://localhost:5173")
                                    .AllowAnyHeader()
                                    .AllowAnyMethod());
                        });

                        services.AddRouting();
                        services.AddControllers();
                    });

                    webHost.Configure(app =>
                    {
                        app.UseCors("TestCorsPolicy");
                        app.UseRouting();
                        app.UseEndpoints(endpoints =>
                        {
                            endpoints.MapGet("/test", context =>
                            {
                                context.Response.StatusCode = (int)HttpStatusCode.OK;
                                return Task.CompletedTask;
                            });
                        });
                    });
                });

            var host = hostBuilder.Start();
            _server = host.GetTestServer();
            _client = _server.CreateClient();
        }

        [Fact]
        public async Task Cors_WithAllowedOrigin_ShouldReturnCorsHeaders()
        {
            // Arrange
            var request = new HttpRequestMessage(HttpMethod.Get, "/test");
            request.Headers.Add("Origin", "http://localhost:5173");

            // Act
            var response = await _client.SendAsync(request);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.True(response.Headers.Contains("Access-Control-Allow-Origin"));
            Assert.Equal("http://localhost:5173", response.Headers.GetValues("Access-Control-Allow-Origin").First());
        }

        [Fact]
        public async Task Cors_WithDisallowedOrigin_ShouldNotReturnCorsHeaders()
        {
            // Arrange
            var request = new HttpRequestMessage(HttpMethod.Get, "/test");
            request.Headers.Add("Origin", "http://malicious-site.com");

            // Act
            var response = await _client.SendAsync(request);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
        }

        [Fact]
        public async Task Cors_WithOptionsRequest_ShouldHandlePreflight()
        {
            // Arrange
            var request = new HttpRequestMessage(HttpMethod.Options, "/test");
            request.Headers.Add("Origin", "http://localhost:5173");
            request.Headers.Add("Access-Control-Request-Method", "GET");
            request.Headers.Add("Access-Control-Request-Headers", "Content-Type");

            // Act
            var response = await _client.SendAsync(request);

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
            Assert.True(response.Headers.Contains("Access-Control-Allow-Origin"));
            Assert.True(response.Headers.Contains("Access-Control-Allow-Methods"));
            Assert.True(response.Headers.Contains("Access-Control-Allow-Headers"));
        }
    }
}

