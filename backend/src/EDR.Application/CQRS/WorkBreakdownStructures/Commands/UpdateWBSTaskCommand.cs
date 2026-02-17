using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Commands
{
    /// <summary>
    /// Command to update Work Breakdown Structure using WBSMasterDto.
    /// </summary>
    public class UpdateWBSTaskCommand : IRequest<WBSMasterDto>
    {
        public int ProjectId { get; }
        public WBSMasterDto WBSMaster { get; }

        public UpdateWBSTaskCommand(int projectId, WBSMasterDto wbsMaster)
        {
            ProjectId = projectId;
            WBSMaster = wbsMaster;
        }
    }
}

