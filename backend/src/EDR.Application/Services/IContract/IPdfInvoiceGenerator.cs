using EDR.Domain.Entities;

namespace EDR.Application.Services.IContract
{
    public interface IPdfInvoiceGenerator
    {
        /// <summary>
        /// Generates a PDF invoice for the specified tenant invoice and returns the file path.
        /// </summary>
        /// <param name="invoice">The invoice details.</param>
        /// <param name="tenant">The tenant details.</param>
        /// <returns>The full path to the generated PDF file.</returns>
        Task<string> GenerateInvoicePdfAsync(TenantInvoice invoice, Tenant tenant);
    }
}
