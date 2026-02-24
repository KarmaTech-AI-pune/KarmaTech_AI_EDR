using System.Threading.Tasks;

namespace EDR.Application.Services.IContract;

public interface IEmailTemplateService
{
    Task<string> GetTemplateAsync(string templateName);
    string RenderTemplate(string template, Dictionary<string, string> parameters);
}

