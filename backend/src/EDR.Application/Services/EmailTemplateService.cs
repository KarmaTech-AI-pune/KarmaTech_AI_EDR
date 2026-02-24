using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using EDR.Application.Services.IContract;

namespace EDR.Application.Services;

public class EmailTemplateService : IEmailTemplateService
{
    private readonly ILogger<EmailTemplateService> _logger;
    private const string TemplateBasePath = "Templates/Email";

    public EmailTemplateService(ILogger<EmailTemplateService> logger)
    {
        _logger = logger;
    }

    public async Task<string> GetTemplateAsync(string templateName)
    {
        var templatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, TemplateBasePath, $"{templateName}.html");
        
        if (!File.Exists(templatePath))
        {
            _logger.LogError($"Email template not found: {templatePath}");
            throw new FileNotFoundException($"Email template not found: {templateName}");
        }

        return await File.ReadAllTextAsync(templatePath);
    }

    public string RenderTemplate(string template, Dictionary<string, string> parameters)
    {
        var renderedTemplate = template;
        foreach (var param in parameters)
        {
            renderedTemplate = renderedTemplate.Replace($"{{{{{param.Key}}}}}", param.Value);
        }
        return renderedTemplate;
    }
}

