using MediatR;
using NJS.Application.Services.IContract;
using NJS.Domain.Models;

namespace NJS.Application.CQRS.Email.Notifications;

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

    public UserRegistrationEmailNotificationHandler(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Handle(UserRegistrationEmailNotification notification, CancellationToken cancellationToken)
    {
        var message = new EmailMessage
        {
            To = notification.UserEmail,
            Subject = "Welcome to NJS Project Management",
            Body = $@"
                <h2>Welcome to NJS Project Management!</h2>
                <p>Your account has been created successfully.</p>
                <p>Here are your login credentials:</p>
                <ul>
                    <li>Username: {notification.Username}</li>
                    <li>Password: {notification.Password}</li>
                </ul>
                <p>Please change your password after your first login.</p>
                <p>Best regards,<br>NJS Project Management Team</p>",
            IsHtml = true
        };

        await _emailService.SendEmailAsync(message);
    }
}
