using System;

namespace NJS.Application.Dtos
{
    public class WBSTaskDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int? ParentId { get; set; }
        public int Level { get; set; }
        public string Title { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public decimal? ResourceAllocation { get; set; }
    }
}
