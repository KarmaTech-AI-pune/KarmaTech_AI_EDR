using NJS.Application.CQRS.PMWorkflow.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Entities;

namespace NJS.Application.Services.IContract
{
    public interface IEntityWorkflowStrategy
    {
        string EntityType { get; }
        Task<PMWorkflowDto> ExecuteAsync(WorkflowActionContext request, CancellationToken cancellationToken);

    }
}
