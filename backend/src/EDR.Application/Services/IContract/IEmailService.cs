using EDR.Domain.Models;
using EDR.Domain.Entities;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace EDR.Application.Services.IContract;

public interface IEmailService
{
    Task SendEmailAsync(EmailMessage message);
    Task SendBulkEmailAsync(List<EmailMessage> messages);
    Task<List<FailedEmailLog>> GetFailedEmailsAsync();
    Task RetryFailedEmailAsync(int failedEmailId);
}

