using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EDR.Application.Services
{
    public class BillingBackgroundService : BackgroundService
    {
        private readonly ILogger<BillingBackgroundService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public BillingBackgroundService(ILogger<BillingBackgroundService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Billing Background Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessBillingLogicAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred in Billing Background Service.");
                }

                // Run daily
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }

        private async Task ProcessBillingLogicAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<TenantDbContext>();

                // 1. Mark pending invoices as "Overdue" if they've passed DueDate
                var pendingInvoices = await context.TenantInvoices
                    .Where(i => i.Status == "Pending" && i.DueDate < DateTime.UtcNow)
                    .ToListAsync();

                foreach (var invoice in pendingInvoices)
                {
                    invoice.Status = "Overdue";
                    _logger.LogInformation("Invoice {InvoiceId} for Tenant {TenantId} marked as Overdue.", invoice.InvoiceId, invoice.TenantId);
                }

                // 2. Suspend tenants with an invoice that is 1 month overdue
                var overdueThresholdDate = DateTime.UtcNow.AddMonths(-1);

                var overdueInvoices = await context.TenantInvoices
                    .Include(i => i.Tenant)
                    .Where(i => i.Status == "Overdue" && i.DueDate < overdueThresholdDate)
                    .ToListAsync();

                foreach (var invoice in overdueInvoices)
                {
                    if (invoice.Tenant.Status != TenantStatus.Suspended && invoice.Tenant.Status != TenantStatus.Cancelled)
                    {
                        invoice.Tenant.Status = TenantStatus.Suspended;
                        _logger.LogWarning("Tenant {TenantId} suspended due to 1-month overdue invoice {InvoiceId}.", invoice.TenantId, invoice.InvoiceId);
                    }
                }

                if (pendingInvoices.Any() || overdueInvoices.Any())
                {
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
