using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Domain.Entities;
using NJS.Domain.Services;
using NJS.Domain.Events;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AuditController : ControllerBase
    {
        private readonly IAuditService _auditService;

        public AuditController(IAuditService auditService)
        {
            _auditService = auditService;
        }

        [HttpPost("test")]
        public async Task<IActionResult> TestAudit()
        {
            try
            {
                var auditEvent = new AuditEvent(
                    "TestEntity",
                    "Created",
                    "123",
                    "{}",
                    "{\"Name\":\"Test\",\"Value\":\"TestValue\"}",
                    "TestUser",
                    DateTime.UtcNow,
                    "Testing audit system",
                    "127.0.0.1",
                    "TestAgent"
                );

                await _auditService.LogAuditAsync(auditEvent);
                return Ok("Audit test completed successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Audit test failed: {ex.Message}");
            }
        }

        [HttpGet("entity/{entityName}/{entityId}")]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogsByEntity(
            string entityName, 
            string entityId)
        {
            try
            {
                var auditLogs = await _auditService.GetAuditLogsAsync(entityName, entityId);
                return Ok(auditLogs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("user/{changedBy}")]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogsByUser(string changedBy)
        {
            try
            {
                var auditLogs = await _auditService.GetAuditLogsByUserAsync(changedBy);
                return Ok(auditLogs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("daterange")]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogsByDateRange(
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate)
        {
            try
            {
                var auditLogs = await _auditService.GetAuditLogsByDateRangeAsync(startDate, endDate);
                return Ok(auditLogs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("summary")]
        public async Task<ActionResult<object>> GetAuditSummary(
            [FromQuery] DateTime? startDate = null, 
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var start = startDate ?? DateTime.UtcNow.AddDays(-30);
                var end = endDate ?? DateTime.UtcNow;

                var auditLogs = await _auditService.GetAuditLogsByDateRangeAsync(start, end);

                var summary = new
                {
                    TotalAuditLogs = auditLogs.Count(),
                    DateRange = new { StartDate = start, EndDate = end },
                    Actions = auditLogs.GroupBy(a => a.Action)
                        .Select(g => new { Action = g.Key, Count = g.Count() }),
                    TopEntities = auditLogs.GroupBy(a => a.EntityName)
                        .Select(g => new { EntityName = g.Key, Count = g.Count() })
                        .OrderByDescending(x => x.Count)
                        .Take(10),
                    TopUsers = auditLogs.GroupBy(a => a.ChangedBy)
                        .Select(g => new { User = g.Key, Count = g.Count() })
                        .OrderByDescending(x => x.Count)
                        .Take(10)
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 