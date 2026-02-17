using System.Collections.Generic;

namespace EDR.Application.Dtos
{
    /// <summary>
    /// Master DTO for WBS request - used for creating/updating WBS structure
    /// </summary>
    public class WBSMasterDto
    {
        /// <summary>
        /// WBS Header ID. Use 0 for creating new WBS, or existing ID for updates
        /// </summary>
        public int WbsHeaderId { get; set; }

        /// <summary>
        /// List of Work Breakdown Structure groups (e.g., Foundation, Exterior)
        /// </summary>
        public List<WBSStructureMasterDto> WorkBreakdownStructures { get; set; } = new List<WBSStructureMasterDto>();
    }

    /// <summary>
    /// Master DTO for Work Breakdown Structure group
    /// </summary>
    public class WBSStructureMasterDto
    {
        /// <summary>
        /// WorkBreakdownStructureId - use 0 for new WBS groups, or existing ID for updates
        /// </summary>
        public int WorkBreakdownStructureId { get; set; }

        /// <summary>
        /// Name of the WBS group (e.g., "Foundation", "Exterior")
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description of the WBS group
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Display order for sorting
        /// </summary>
        public int DisplayOrder { get; set; }

        /// <summary>
        /// List of tasks within this WBS group
        /// </summary>
        public List<WBSTaskDto> Tasks { get; set; } = new List<WBSTaskDto>();
    }
}


