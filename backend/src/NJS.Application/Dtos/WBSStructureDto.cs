using System;
using System.Collections.Generic;
using NJS.Application.Dtos; // For WBSTaskDto

namespace NJS.Application.Dtos
{
    public class WBSStructureDto
    {
        public int Id { get; set; }
        public int WBSHeaderId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }

        public ICollection<WBSTaskDto> Tasks { get; set; } // Assuming WBSTaskDto exists
    }
}
