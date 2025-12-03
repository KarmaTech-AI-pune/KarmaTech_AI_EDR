using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.UnitWork;
using NJS.Repositories.Interfaces; // Add this for IWBSOptionRepository
using Microsoft.Extensions.Logging; // Add this for ILogger

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class UpdateWBSTaskCommandHandler : IRequestHandler<UpdateWBSTaskCommand, WBSMasterDto>
    {
        private readonly IMediator _mediator;
        private readonly ILogger<UpdateWBSTaskCommandHandler> _logger;
        private readonly IWBSOptionRepository _wbsOptionRepository; // Inject IWBSOptionRepository

        public UpdateWBSTaskCommandHandler(IMediator mediator, ILogger<UpdateWBSTaskCommandHandler> logger, IWBSOptionRepository wbsOptionRepository) // Added IWBSOptionRepository
        {
            _mediator = mediator;
            _logger = logger;
            _wbsOptionRepository = wbsOptionRepository; // Assign repository
        }

        public async Task<WBSMasterDto> Handle(UpdateWBSTaskCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling UpdateWBSTaskCommand for ProjectId {ProjectId}, Payload {@Payload}",
                request.ProjectId, request.WBSMaster);

            // Use SetWBSCommand to handle the update
            var setCommand = new SetWBSCommand(request.ProjectId, request.WBSMaster);
            await _mediator.Send(setCommand, cancellationToken);

            _logger.LogInformation("WBS updated successfully for ProjectId {ProjectId}", request.ProjectId);

            return request.WBSMaster;
        }
    }
}
