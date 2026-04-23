using System;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;
using EDR.API.Controllers;
using EDR.Domain.Database;
using EDR.Domain.Entities;

namespace EDR.API.Tests.Controllers
{
    public class ExcelControllerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly ExcelController _controller;

        public ExcelControllerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ProjectManagementContext(options, null, null);
            _controller = new ExcelController(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public void ExportOptionsToExcel_ReturnsFileResult()
        {
            // Arrange
            _context.Projects.Add(new Project { Id = 1, TenantId = 1, TypeOfClient = "Tech", Sector = "IT", ContractType = "Fixed", Currency = "USD" });
            _context.Projects.Add(new Project { Id = 2, TenantId = 1, TypeOfClient = "Finance", Sector = "Banking", ContractType = "T&M", Currency = "EUR" });
            _context.SaveChanges();

            // Act
            var result = _controller.ExportOptionsToExcel();

            // Assert
            var fileResult = Assert.IsType<FileContentResult>(result);
            Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileResult.ContentType);
            Assert.Equal("ProjectOptions.xlsx", fileResult.FileDownloadName);
            Assert.True(fileResult.FileContents.Length > 0);
        }
    }
}
