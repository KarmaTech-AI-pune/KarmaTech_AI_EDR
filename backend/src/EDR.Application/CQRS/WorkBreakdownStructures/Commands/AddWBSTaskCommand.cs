using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Commands
{
    /// <summary>
    /// Command to add tasks to a Work Breakdown Structure using WBSMasterDto.
    /// </summary>
    public class AddWBSTaskCommand : IRequest<WBSMasterDto> // Returns WBSMasterDto
    {
        public int ProjectId { get; }
        public WBSMasterDto WBSMaster { get; }

        public AddWBSTaskCommand(int projectId, WBSMasterDto wbsMaster)
        {
            ProjectId = projectId;
            WBSMaster = wbsMaster;
        }
    }
}

