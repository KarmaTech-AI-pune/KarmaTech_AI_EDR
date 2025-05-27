using System;

namespace NJS.Application.Dtos
{
    public class JobStartFormHistoryDto
    {
        public int Id { get; set; }
        public int JobStartFormHeaderId { get; set; }
        public int StatusId { get; set; }
        public string Status { get; set; }
        public string Action { get; set; }
        public string Comments { get; set; }
        public DateTime ActionDate { get; set; }
        public string ActionBy { get; set; }
        public string ActionByName { get; set; }
        public string AssignedToId { get; set; }
        public string AssignedToName { get; set; }
    }
}
