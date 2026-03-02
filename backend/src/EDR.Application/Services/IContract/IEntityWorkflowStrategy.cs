using EDR.Application.CQRS.PMWorkflow.Commands;
using EDR.Application.Dtos;
using EDR.Domain.Entities;

namespace EDR.Application.Services.IContract
{
    public interface IEntityWorkflowStrategy
    {
        string EntityType { get; }
        Task<PMWorkflowDto> ExecuteAsync(WorkflowActionContext request, CancellationToken cancellationToken);

    }
}

