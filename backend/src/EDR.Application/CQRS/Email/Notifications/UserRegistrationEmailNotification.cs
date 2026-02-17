using MediatR;
using EDR.Application.Services.IContract;
using EDR.Domain.Models;
using Microsoft.Extensions.Logging;

namespace EDR.Application.CQRS.Email.Notifications;

public class UserRegistrationEmailNotification : INotification
{
    public string UserEmail { get; }
    public string Username { get; }
    public string Password { get; }

    public UserRegistrationEmailNotification(string userEmail, string username, string password)
    {
        UserEmail = userEmail;
        Username = username;
        Password = password;
    }
}

public class UserRegistrationEmailNotificationHandler : INotificationHandler<UserRegistrationEmailNotification>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<UserRegistrationEmailNotificationHandler> _logger;

    public UserRegistrationEmailNotificationHandler(IEmailService emailService, ILogger<UserRegistrationEmailNotificationHandler> logger)
    {
        _emailService = emailService;
        _logger = logger;

    }

    public async Task Handle(UserRegistrationEmailNotification notification, CancellationToken cancellationToken)
    {
        string body = GetWelcomeEmailBody(notification.UserEmail, notification.Password);

        var message = new EmailMessage
        {
            To = notification.UserEmail,
            Subject = "Onboarding User!",
            Body = body,
            IsHtml = true
        };
        _logger.LogInformation("Welcome to Onboarding UserName:{Name},Password:{Password}", notification.UserEmail, notification.Password);

        await _emailService.SendEmailAsync(message);
    }

    public static string GetWelcomeEmailBody(string userEmail, string password)
    {
        
        string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates/Email", "onboarding.html");
        string body = File.ReadAllText(templatePath);

        // Replace placeholders
        body = body.Replace("{{UserEmail}}", userEmail)
                   .Replace("{{Password}}", password);

        return body;
    }
}

public class AccountCreationEmailNotification : INotification
{
    public string FirstName { get; }
    public string LastName { get; }
    public string EmailAddress { get; }
    public string PhoneNumber { get; }
    public string CompanyName { get; }
    public string CompanyAddress { get; }
    public string Subdomain { get; }
    public string SubscriptionPlan { get; }

    public AccountCreationEmailNotification(
        string firstName,
        string lastName,
        string emailAddress,
        string phoneNumber,
        string companyName,
        string companyAddress,
        string subdomain,
        string subscriptionPlan)
    {
        FirstName = firstName;
        LastName = lastName;
        EmailAddress = emailAddress;
        PhoneNumber = phoneNumber;
        CompanyName = companyName;
        CompanyAddress = companyAddress;
        Subdomain = subdomain;
        SubscriptionPlan = subscriptionPlan;
    }
}

public class AccountCreationEmailNotificationHandler : INotificationHandler<AccountCreationEmailNotification>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<AccountCreationEmailNotificationHandler> _logger;

    public AccountCreationEmailNotificationHandler(
        IEmailService emailService,
        ILogger<AccountCreationEmailNotificationHandler> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public async Task Handle(AccountCreationEmailNotification notification, CancellationToken cancellationToken)
    {
        try
        {
            var subject = $"New Account Created: {notification.FirstName} {notification.LastName}";
            var body = GetEmailBody(notification);

            var message = new EmailMessage
            {
                To = "ankursramapure@gmail.com",
                Subject = subject,
                Body = body,
                IsHtml = true
            };

            await _emailService.SendEmailAsync(message);
            _logger.LogInformation("Account creation notification email sent successfully for: {Email}", notification.EmailAddress);
        }
        catch (Exception ex)
        {
            // Log error but don't throw - fail silently for email notifications
            _logger.LogError(ex, "Failed to send account creation notification email for: {Email}", notification.EmailAddress);
        }
    }

    private string GetEmailBody(AccountCreationEmailNotification notification)
    {
        return $@"
            <h2>New Account Created</h2>
            <p>A new account has been created in the EDR Project Management system.</p>

            <h3>Account Details:</h3>
            <table style='border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;'>
                <tr style='background-color: #f2f2f2;'>
                    <td style='border: 1px solid #ddd; padding: 8px; font-weight: bold;'>First Name:</td>
                    <td style='border: 1px solid #ddd; padding: 8px;'>{notification.FirstName}</td>
                </tr>
                <tr>
                    <td style='border: 1px solid #ddd; padding: 8px; font-weight: bold;'>Last Name:</td>
                    <td style='border: 1px solid #ddd; padding: 8px;'>{notification.LastName}</td>
                </tr>
                <tr style='background-color: #f2f2f2;'>
                    <td style='border: 1px solid #ddd; padding: 8px; font-weight: bold;'>Email Address:</td>
                    <td style='border: 1px solid #ddd; padding: 8px;'>{notification.EmailAddress}</td>
                </tr>
                <tr>
                    <td style='border: 1px solid #ddd; padding: 8px; font-weight: bold;'>Phone Number:</td>
                    <td style='border: 1px solid #ddd; padding: 8px;'>{notification.PhoneNumber}</td>
                </tr>
                <tr style='background-color: #f2f2f2;'>
                    <td style='border: 1px solid #ddd; padding: 8px; font-weight: bold;'>Company Name:</td>
                    <td style='border: 1px solid #ddd; padding: 8px;'>{notification.CompanyName}</td>
                </tr>
                <tr>
                    <td style='border: 1px solid #ddd; padding: 8px; font-weight: bold;'>Company Address:</td>
                    <td style='border: 1px solid #ddd; padding: 8px;'>{notification.CompanyAddress}</td>
                </tr>
                <tr style='background-color: #f2f2f2;'>
                    <td style='border: 1px solid #ddd; padding: 8px; font-weight: bold;'>Subdomain:</td>
                    <td style='border: 1px solid #ddd; padding: 8px;'>{notification.Subdomain}</td>
                </tr>
                <tr>
                    <td style='border: 1px solid #ddd; padding: 8px; font-weight: bold;'>Subscription Plan:</td>
                    <td style='border: 1px solid #ddd; padding: 8px;'>{notification.SubscriptionPlan}</td>
                </tr>
            </table>

            <p style='margin-top: 20px;'>Please review the account details and take any necessary action.</p>

            <p>Best regards,<br>EDR Project Management System</p>";
    }
}


