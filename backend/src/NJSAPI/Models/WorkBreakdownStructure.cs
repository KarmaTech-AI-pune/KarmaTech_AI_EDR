// File: backend/src/models/WorkBreakdownStructure.cs
// Purpose: Work Breakdown Structure model definition

namespace NJSAPI.Models
{
     public class WorkBreakdownStructure
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string Structure { get; set; }
        public List<WBSTask> Tasks { get; set; }
    }

    public class WBSTask
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Budget { get; set; }
        public List<string> Resources { get; set; }
    }
}