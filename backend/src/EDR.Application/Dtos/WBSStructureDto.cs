using System;
using System.Collections.Generic;

namespace EDR.Application.Dtos
{
    public class WBSStructureDto
    {
        public int Id { get; set; }

        /// <summary>
        /// WorkBreakdownStructureId - maps to WorkBreakdownStructure.Id in database
        /// Use 0 for new WBS groups, or existing ID for updates
        /// </summary>
        public int WorkBreakdownStructureId { get; set; }

        public int WBSHeaderId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }

        public ICollection<WBSTaskDto> Tasks { get; set; } = new List<WBSTaskDto>();
    }
}

