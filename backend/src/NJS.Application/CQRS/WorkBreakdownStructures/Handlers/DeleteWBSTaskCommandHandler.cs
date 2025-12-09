using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.UnitWork;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class DeleteWBSTaskCommandHandler : IRequestHandler<DeleteWBSTaskCommand, WBSMasterDto>
    {
        private readonly IMediator _mediator;
        private readonly ILogger<DeleteWBSTaskCommandHandler> _logger;

        public DeleteWBSTaskCommandHandler(IMediator mediator, ILogger<DeleteWBSTaskCommandHandler> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        public async Task<WBSMasterDto> Handle(DeleteWBSTaskCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling DeleteWBSTaskCommand for ProjectId {ProjectId}, Payload {@Payload}",
                request.ProjectId, request.WBSMaster);

            // Use SetWBSCommand to handle the delete (tasks not in the payload will be removed)
            var setCommand = new SetWBSCommand(request.ProjectId, request.WBSMaster);
            await _mediator.Send(setCommand, cancellationToken);

            _logger.LogInformation("WBS tasks deleted successfully for ProjectId {ProjectId}", request.ProjectId);

            return request.WBSMaster;
        }
    }
}
