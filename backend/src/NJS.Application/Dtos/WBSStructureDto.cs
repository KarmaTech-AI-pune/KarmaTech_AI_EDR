using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class WBSStructureDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string Version { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public List<WBSTaskDto> Tasks { get; set; } = new();
    }
}
