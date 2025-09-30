using System.Threading.Tasks;

namespace NJS.Application.Services.IContract;

public interface IEmailTemplateService
{
    Task<string> GetTemplateAsync(string templateName);
    string RenderTemplate(string template, Dictionary<string, string> parameters);
}
