using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.Services.IContract;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.API.Tests.Controllers
{
    public class ReleaseNotesControllerTests
    {
        private readonly Mock<IReleaseNotesGeneratorService> _serviceMock;
        private readonly Mock<IReleaseNotesRepository> _repoMock;
        private readonly IMemoryCache _cache;
        private readonly Mock<ILogger<ReleaseNotesController>> _loggerMock;
        private readonly ReleaseNotesController _controller;

        public ReleaseNotesControllerTests()
        {
            _serviceMock = new Mock<IReleaseNotesGeneratorService>();
            _repoMock = new Mock<IReleaseNotesRepository>();
            _cache = new MemoryCache(new MemoryCacheOptions());
            _loggerMock = new Mock<ILogger<ReleaseNotesController>>();

            _controller = new ReleaseNotesController(
                _serviceMock.Object, 
                _repoMock.Object, 
                _cache, 
                _loggerMock.Object);
        }

        [Fact]
        public async Task GetCurrentReleaseNotes_ReturnsOk_WhenFoundInRepo()
        {
            var note = new ReleaseNotes { Version = "1.0", Environment = "dev" };
            _repoMock.Setup(r => r.GetLatestByEnvironmentAsync("dev"))
                .ReturnsAsync(note);

            var result = await _controller.GetCurrentReleaseNotes("dev");

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(note, okResult.Value);
        }

        [Fact]
        public async Task GetCurrentReleaseNotes_ReturnsOk_WhenGeneratedFromTag()
        {
            _repoMock.Setup(r => r.GetLatestByEnvironmentAsync("dev"))
                .ReturnsAsync((ReleaseNotes)null);
                
            var note = new ReleaseNotes { Version = "1.0", Environment = "dev" };
            _serviceMock.Setup(s => s.GenerateReleaseNotesForLatestTagAsync(It.IsAny<string>()))
                .ReturnsAsync(note);

            var result = await _controller.GetCurrentReleaseNotes("dev");

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(note, okResult.Value);
        }

        [Fact]
        public async Task GetCurrentReleaseNotes_ReturnsNotFound_WhenNull()
        {
            _repoMock.Setup(r => r.GetLatestByEnvironmentAsync("dev"))
                .ReturnsAsync((ReleaseNotes)null);
                
            _serviceMock.Setup(s => s.GenerateReleaseNotesForLatestTagAsync(It.IsAny<string>()))
                .ReturnsAsync((ReleaseNotes)null);

            var result = await _controller.GetCurrentReleaseNotes("dev");

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetReleaseNotesByVersion_ReturnsOk_WhenFound()
        {
            var note = new ReleaseNotes { Version = "1.0" };
            _repoMock.Setup(r => r.GetByVersionAsync("1.0"))
                .ReturnsAsync(note);

            var result = await _controller.GetReleaseNotesByVersion("1.0");

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(note, okResult.Value);
        }

        [Fact]
        public async Task GetReleaseNotesByVersion_ReturnsNotFound_WhenMissing()
        {
            _repoMock.Setup(r => r.GetByVersionAsync("1.0"))
                .ReturnsAsync((ReleaseNotes)null);

            var result = await _controller.GetReleaseNotesByVersion("1.0");

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetReleaseHistory_ReturnsOk()
        {
            _repoMock.Setup(r => r.GetByEnvironmentAsync("dev", 0, 10))
                .ReturnsAsync(new List<ReleaseNotes> { new ReleaseNotes() });

            var result = await _controller.GetReleaseHistory("dev", 0, 10);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task SearchReleaseNotes_ReturnsOk()
        {
            _repoMock.Setup(r => r.SearchAsync("test", "dev", null, null, 0, 10))
                .ReturnsAsync(new List<ReleaseNotes>());

            var result = await _controller.SearchReleaseNotes("test", "dev");

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GenerateReleaseNotesForTag_ReturnsOk()
        {
            var note = new ReleaseNotes { Version = "v1.0", Environment = "dev" };
            _serviceMock.Setup(s => s.GenerateReleaseNotesForTagAsync("v1.0", "Kiro/dev"))
                .ReturnsAsync(note);

            var result = await _controller.GenerateReleaseNotesForTag("v1.0");

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(note, okResult.Value);
        }

        [Fact]
        public async Task GenerateReleaseNotesForLatestTag_ReturnsOk()
        {
            var note = new ReleaseNotes { Version = "v1.0", Environment = "dev" };
            _serviceMock.Setup(s => s.GenerateReleaseNotesForLatestTagAsync("Kiro/dev"))
                .ReturnsAsync(note);

            var result = await _controller.GenerateReleaseNotesForLatestTag();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(note, okResult.Value);
        }

        [Fact]
        public async Task GenerateReleaseNotesForLatestTag_ReturnsNotFound_WhenNull()
        {
            _serviceMock.Setup(s => s.GenerateReleaseNotesForLatestTagAsync("Kiro/dev"))
                .ReturnsAsync((ReleaseNotes)null);

            var result = await _controller.GenerateReleaseNotesForLatestTag();

            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public void ClearCache_ReturnsOk()
        {
            var result = _controller.ClearCache("dev");

            Assert.IsType<OkObjectResult>(result);
        }
    }
}
