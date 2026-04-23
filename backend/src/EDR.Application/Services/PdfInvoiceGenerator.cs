using System;
using System.IO;
using System.Threading.Tasks;
using EDR.Application.Services.IContract;
using EDR.Domain.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QuestPDF.Previewer;

namespace EDR.Application.Services
{
    public class PdfInvoiceGenerator : IPdfInvoiceGenerator
    {
        public PdfInvoiceGenerator()
        {
            // Set QuestPDF license to Community
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public async Task<string> GenerateInvoicePdfAsync(TenantInvoice invoice, Tenant tenant)
        {
            var fileName = $"Invoice_{invoice.InvoiceId}_{DateTime.Now:yyyyMMddHHmmss}.pdf";
            var tempPath = Path.Combine(Path.GetTempPath(), "EDR_Invoices");
            
            if (!Directory.Exists(tempPath))
            {
                Directory.CreateDirectory(tempPath);
            }

            var filePath = Path.Combine(tempPath, fileName);

            // Generate the PDF document
            Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(1, Unit.Inch);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Verdana));

                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("KarmaTech AI").FontSize(20).SemiBold().FontColor(Colors.Blue.Medium);
                            col.Item().Text("44/102, Navasahyadri Society, Karvenagar, Pune, Maharashtra, India").FontSize(9);
                            col.Item().Text("Email: info@karmatech-ai.com").FontSize(9);
                            col.Item().Text("Phone: +91-9850340276, 9850340276").FontSize(9);
                            col.Item().Text("Web: www.karmatech-ai.com").FontSize(9);
                            col.Item().Text("GSTIN: 27AAACK1234F1ZX").FontSize(9);
                        });

                        row.RelativeItem().Column(col =>
                        {
                            col.Item().AlignRight().Text("INVOICE").FontSize(24).SemiBold();
                            col.Item().AlignRight().Text($"Invoice #: {invoice.InvoiceId}");
                            col.Item().AlignRight().Text($"Date: {DateTime.Now:MMMM dd, yyyy}");
                        });
                    });

                    page.Content().PaddingVertical(1, Unit.Inch).Column(column =>
                    {
                        column.Spacing(20);

                        column.Item().Row(row =>
                        {
                            row.RelativeItem().Column(col =>
                            {
                                col.Item().Text("Bill To:").SemiBold();
                                col.Item().Text(tenant.CompanyName ?? tenant.Name);
                                col.Item().Text(tenant.ContactEmail);
                                col.Item().Text(tenant.ContactPhone ?? "");
                            });

                            row.RelativeItem().Column(col =>
                            {
                                col.Item().AlignRight().Text("Payment Status:").SemiBold();
                                col.Item().AlignRight().Text(invoice.Status == "Paid" ? "PAID" : "PENDING")
                                    .FontColor(invoice.Status == "Paid" ? Colors.Green.Medium : Colors.Red.Medium)
                                    .SemiBold();
                                
                                if (invoice.PaidDate.HasValue)
                                {
                                    col.Item().AlignRight().Text($"Paid On: {invoice.PaidDate.Value:MMMM dd, yyyy}");
                                }
                                col.Item().AlignRight().Text($"Due Date: {invoice.DueDate:MMMM dd, yyyy}");
                            });
                        });

                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(40);
                                columns.RelativeColumn();
                                columns.ConstantColumn(100);
                                columns.ConstantColumn(100);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(HeaderStyle).Text("#");
                                header.Cell().Element(HeaderStyle).Text("Description");
                                header.Cell().Element(HeaderStyle).AlignRight().Text("Unit Price");
                                header.Cell().Element(HeaderStyle).AlignRight().Text("Total");

                                static IContainer HeaderStyle(IContainer container)
                                {
                                    return container.DefaultTextStyle(x => x.SemiBold())
                                                    .PaddingVertical(5)
                                                    .BorderBottom(1)
                                                    .BorderColor(Colors.Grey.Lighten2);
                                }
                            });

                            table.Cell().Element(CellStyle).Text("1");
                            table.Cell().Element(CellStyle).Text($"{tenant.SubscriptionPlan?.Name ?? "Subscription"} Plan - 1 Month");
                            table.Cell().Element(CellStyle).AlignRight().Text($"{invoice.Amount:C}");
                            table.Cell().Element(CellStyle).AlignRight().Text($"{invoice.Amount:C}");

                            static IContainer CellStyle(IContainer container)
                            {
                                return container.BorderBottom(1)
                                                .BorderColor(Colors.Grey.Lighten4)
                                                .PaddingVertical(5);
                            }
                        });

                        column.Item().AlignRight().Text(text =>
                        {
                            text.Span("Total Amount: ").FontSize(14).SemiBold();
                            text.Span($"{invoice.Amount:C}").FontSize(16).SemiBold().FontColor(Colors.Blue.Medium);
                        });

                        if (invoice.Status != "Paid")
                        {
                            column.Item().PaddingTop(20).Text("Note: Please complete the payment by the due date to avoid service interruption.")
                                .FontSize(9).Italic().FontColor(Colors.Grey.Medium);
                        }
                    });

                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                        x.Span(" of ");
                        x.TotalPages();
                    });
                });
            }).GeneratePdf(filePath);

            return await Task.FromResult(filePath);
        }
    }
}
