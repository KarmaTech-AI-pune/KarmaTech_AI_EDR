using MediatR;
using EDR.Domain.Models;
using EDR.Application.Services;
using EDR.Application.Services.IContract;

namespace EDR.Application.CQRS.Email.Commands;

public class SendEmailCommand : IRequest<bool>
{
    public string To { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsHtml { get; set; } = true;
}

public class SendEmailCommandHandler : IRequestHandler<SendEmailCommand, bool>
{
    private readonly IEmailService _emailService;

    public SendEmailCommandHandler(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task<bool> Handle(SendEmailCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var message = new EmailMessage
            {
                To = request.To,
                Subject = request.Subject,
                Body = request.Body,
                IsHtml = request.IsHtml
            };

            await _emailService.SendEmailAsync(message);
            return true;
        }
        catch
        {
            return false;
        }
    }
}

