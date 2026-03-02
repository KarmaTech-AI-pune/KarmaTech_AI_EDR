using Microsoft.Extensions.Options;
using EDR.Domain.Models;
using EDR.Domain.Entities;
using EDR.Domain.Database;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using EDR.Application.Services.IContract;
using EDR.Application.Extensions;

namespace EDR.Application.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly ProjectManagementContext _dbContext;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IOptions<EmailSettings> emailSettings,
        ProjectManagementContext dbContext,
        ILogger<EmailService> logger)
    {
        _emailSettings = emailSettings.Value;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task SendEmailAsync(EmailMessage message)
    {
        if (!_emailSettings.EnableEmailNotifications)
        {
            _logger.LogEmailOperation(
                LogLevel.Information,
                $"Skipping email to {message.To}",
                message.Body
            );
            return;
        }

        try
        {
            var email = CreateMimeMessage(message);
            await SendEmailWithRetryAsync(email, message);
        }
        catch (Exception ex)
        {
            await LogFailedEmail(message, ex.Message);
            throw;
        }
    }

    public async Task SendBulkEmailAsync(List<EmailMessage> messages)
    {
        if (!_emailSettings.EnableEmailNotifications)
        {
            _logger.LogEmailOperation(
                LogLevel.Information,
                "Skipping bulk emails",
                string.Join(", ", messages.Select(m => m.Body))
            );
            return;
        }

        foreach (var message in messages)
        {
            try
            {
                await SendEmailAsync(message);
            }
            catch (Exception ex)
            {
                _logger.LogEmailOperation(
                    LogLevel.Error,
                    $"Failed to send email to {message.To}",
                    message.Body,
                    ex
                );
                // Continue with next message even if one fails
            }
        }
    }

    public async Task<List<FailedEmailLog>> GetFailedEmailsAsync()
    {
        return await _dbContext.FailedEmailLogs
            .Where(f => !f.IsResolved)
            .OrderByDescending(f => f.AttemptedAt)
            .ToListAsync();
    }

    public async Task RetryFailedEmailAsync(int failedEmailId)
    {
        var failedEmail = await _dbContext.FailedEmailLogs.FindAsync(failedEmailId);
        if (failedEmail == null)
        {
            throw new ArgumentException("Failed email not found", nameof(failedEmailId));
        }

        var message = new EmailMessage
        {
            To = failedEmail.To,
            Subject = failedEmail.Subject,
            Body = failedEmail.Body,
            IsHtml = true
        };

        try
        {
            await SendEmailAsync(message);
            
            failedEmail.IsResolved = true;
            failedEmail.LastRetryAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            failedEmail.RetryCount++;
            failedEmail.LastRetryAt = DateTime.UtcNow;
            failedEmail.ErrorMessage = ex.Message;
            await _dbContext.SaveChangesAsync();
            throw;
        }
    }

    private MimeMessage CreateMimeMessage(EmailMessage message)
    {
        var email = new MimeMessage();
        email.From.Add(new MailboxAddress(_emailSettings.FromName, _emailSettings.FromEmail));
       email.To.AddRange(InternetAddressList.Parse(message.To));
        email.Subject = message.Subject;

        var builder = new BodyBuilder();
        if (message.IsHtml)
        {
            builder.HtmlBody = message.Body;
        }
        else
        {
            builder.TextBody = message.Body;
        }

        // Add attachments if any
        foreach (var attachment in message.Attachments)
        {
            builder.Attachments.Add(attachment);
        }

        email.Body = builder.ToMessageBody();
        return email;
    }

    private async Task SendEmailWithRetryAsync(MimeMessage email, EmailMessage originalMessage, int maxRetries = 1)
    {
        var retryCount = 0;
        while (true)
        {
            try
            {
                using var client = new SmtpClient();
                await client.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.Port, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
                await client.SendAsync(email);
                await client.DisconnectAsync(true);
                return;
            }
            catch (Exception ex)
            {
                retryCount++;
                if (retryCount >= maxRetries)
                {
                    await LogFailedEmail(originalMessage, ex.Message);
                    throw;
                }
                await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, retryCount))); // Exponential backoff
            }
        }
    }

    private async Task LogFailedEmail(EmailMessage message, string errorMessage)
    {
        var failedEmail = new FailedEmailLog
        {
            To = message.To,
            Subject = message.Subject,
            Body = message.Body,
            ErrorMessage = errorMessage,
            AttemptedAt = DateTime.UtcNow,
            RetryCount = 0,
            IsResolved = false
        };

        _dbContext.FailedEmailLogs.Add(failedEmail);
        await _dbContext.SaveChangesAsync();
        _logger.LogEmailOperation(
            LogLevel.Error,
            $"Failed to send email to {message.To}. Error: {errorMessage}",
            message.Body
        );
    }
}

