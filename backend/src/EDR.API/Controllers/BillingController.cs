using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace EDR.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BillingController : ControllerBase
    {
        private readonly TenantDbContext _context;

        public BillingController(TenantDbContext context)
        {
            _context = context;
        }

        // GET: api/Billing/dashboard
        [HttpGet("dashboard")]
        public async Task<ActionResult<object>> GetBillingDashboard()
        {
            try
            {
                var query = _context.TenantInvoices.Include(i => i.Tenant).AsQueryable();

                decimal totalRevenue = await query.Where(i => i.Status == "Paid").SumAsync(i => i.Amount);

                DateTime startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
                decimal monthlyRevenue = await query
                    .Where(i => i.Status == "Paid" && i.PaidDate >= startOfMonth)
                    .SumAsync(i => i.Amount);

                decimal pendingPayments = await query
                    .Where(i => i.Status == "Pending")
                    .SumAsync(i => i.Amount);

                decimal overduePayments = await query
                    .Where(i => i.Status == "Overdue")
                    .SumAsync(i => i.Amount);

                var recentInvoices = await query
                    .OrderByDescending(i => i.CreatedAt)
                    .Take(50)
                    .Select(i => new
                    {
                        id = i.Id,
                        tenantName = !string.IsNullOrWhiteSpace(i.Tenant.CompanyName) ? i.Tenant.CompanyName : i.Tenant.Name,
                        tenantId = i.TenantId,
                        invoiceId = i.InvoiceId,
                        amount = i.Amount,
                        status = i.Status,
                        dueDate = i.DueDate,
                        paidDate = i.PaidDate,
                        paymentId = i.PaymentId,
                        receiptUrl = i.ReceiptUrl,
                        createdAt = i.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new { totalRevenue, monthlyRevenue, pendingPayments, overduePayments, invoices = recentInvoices });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching billing dashboard data", details = ex.Message });
            }
        }

        // POST: api/Billing/invoice
        [HttpPost("invoice")]
        public async Task<ActionResult<object>> CreateInvoice([FromBody] CreateInvoiceRequest request)
        {
            try
            {
                var tenant = await _context.Tenants.FindAsync(request.TenantId);
                if (tenant == null)
                    return NotFound(new { message = $"Tenant with ID {request.TenantId} not found." });

                var invoice = new TenantInvoice
                {
                    TenantId = request.TenantId,
                    InvoiceId = string.IsNullOrWhiteSpace(request.InvoiceId)
                        ? "inv_" + Guid.NewGuid().ToString("N")[..12]
                        : request.InvoiceId,
                    Amount = request.Amount,
                    Status = request.Status,
                    DueDate = request.DueDate,
                    PaidDate = request.Status == "Paid" ? (request.PaidDate ?? DateTime.UtcNow) : null,
                    PaymentId = request.PaymentId,
                    ReceiptUrl = request.ReceiptUrl ?? "",
                    CreatedAt = DateTime.UtcNow
                };

                _context.TenantInvoices.Add(invoice);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    id = invoice.Id,
                    invoiceId = invoice.InvoiceId,
                    tenantName = !string.IsNullOrWhiteSpace(tenant.CompanyName) ? tenant.CompanyName : tenant.Name,
                    amount = invoice.Amount,
                    status = invoice.Status,
                    dueDate = invoice.DueDate,
                    paidDate = invoice.PaidDate,
                    createdAt = invoice.CreatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create invoice", details = ex.Message });
            }
        }

        // PUT: api/Billing/invoice/{id}
        [HttpPut("invoice/{id}")]
        public async Task<ActionResult<object>> UpdateInvoice(int id, [FromBody] CreateInvoiceRequest request)
        {
            try
            {
                var invoice = await _context.TenantInvoices.FindAsync(id);
                if (invoice == null)
                    return NotFound(new { message = $"Invoice with ID {id} not found." });

                invoice.Amount = request.Amount;
                invoice.InvoiceId = request.InvoiceId;
                invoice.Status = request.Status;
                invoice.DueDate = request.DueDate;
                invoice.PaidDate = request.Status == "Paid" ? (request.PaidDate ?? DateTime.UtcNow) : null;
                invoice.PaymentId = request.PaymentId;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Invoice updated successfully", id = invoice.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update invoice", details = ex.Message });
            }
        }

        // DELETE: api/Billing/invoice/{id}
        [HttpDelete("invoice/{id}")]
        public async Task<ActionResult> DeleteInvoice(int id)
        {
            try
            {
                var invoice = await _context.TenantInvoices.FindAsync(id);
                if (invoice == null)
                    return NotFound(new { message = $"Invoice with ID {id} not found." });

                _context.TenantInvoices.Remove(invoice);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Invoice deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete invoice", details = ex.Message });
            }
        }

        // GET: api/Billing/tenants  - for populating the dropdown in Create Invoice form
        [HttpGet("tenants")]
        public async Task<ActionResult<object>> GetTenants()
        {
            try
            {
                var tenants = await _context.Tenants
                    .Select(t => new { id = t.Id, name = !string.IsNullOrWhiteSpace(t.CompanyName) ? t.CompanyName : t.Name })
                    .ToListAsync();
                return Ok(tenants);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch tenants", details = ex.Message });
            }
        }
    }

    public class CreateInvoiceRequest
    {
        public int TenantId { get; set; }
        public string InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } // Paid, Pending, Overdue
        public DateTime DueDate { get; set; }
        public DateTime? PaidDate { get; set; }
        public string PaymentId { get; set; }
        public string ReceiptUrl { get; set; }
    }
}
