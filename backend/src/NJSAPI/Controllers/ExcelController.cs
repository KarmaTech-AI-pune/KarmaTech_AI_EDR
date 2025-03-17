using Microsoft.AspNetCore.Mvc;
using NJS.Domain.Database;
using ClosedXML.Excel;
using System.Linq;
using System.IO;
using NJS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExcelController : ControllerBase
    {
        private readonly ProjectManagementContext _context;

        public ExcelController(ProjectManagementContext context)
        {
            _context = context;
        }

        [HttpGet("export-options")]
        public IActionResult ExportOptionsToExcel()
        {
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Options");

                // Headers
                worksheet.Cell(1, 1).Value = "Client Sectors";
                worksheet.Cell(1, 2).Value = "Project Sectors";
                worksheet.Cell(1, 3).Value = "Project Statuses";
                worksheet.Cell(1, 4).Value = "Contract Types";
                worksheet.Cell(1, 5).Value = "Currencies";

                // Get distinct values
                var clientSectors = _context.Projects.Select(p => p.TypeOfClient).Distinct().ToList();
                var sectors = _context.Projects.Select(p => p.Sector).Distinct().ToList();
                var contractTypes = _context.Projects.Select(p => p.ContractType).Distinct().ToList();
                var currencies = _context.Projects.Select(p => p.Currency).Distinct().ToList();
                
                // Get enum values
                var statuses = Enum.GetValues(typeof(ProjectStatus))
                    .Cast<ProjectStatus>()
                    .Select(s => s.ToString())
                    .ToList();

                // Find the maximum length of all lists
                var maxLength = new[] { 
                    clientSectors.Count,
                    sectors.Count,
                    statuses.Count,
                    contractTypes.Count,
                    currencies.Count
                }.Max();

                // Fill data
                for (int i = 0; i < maxLength; i++)
                {
                    worksheet.Cell(i + 2, 1).Value = i < clientSectors.Count ? clientSectors[i] : "";
                    worksheet.Cell(i + 2, 2).Value = i < sectors.Count ? sectors[i] : "";
                    worksheet.Cell(i + 2, 3).Value = i < statuses.Count ? statuses[i] : "";
                    worksheet.Cell(i + 2, 4).Value = i < contractTypes.Count ? contractTypes[i] : "";
                    worksheet.Cell(i + 2, 5).Value = i < currencies.Count ? currencies[i] : "";
                }

                // Style the worksheet
                var headerRange = worksheet.Range(1, 1, 1, 5);
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

                worksheet.Columns().AdjustToContents();

                // Generate Excel file
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();

                    return File(
                        content,
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "ProjectOptions.xlsx"
                    );
                }
            }
        }
    }
}
