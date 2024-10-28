// File: backend/src/models/Project.cs
// Purpose: Project model definition

namespace NJSAPI.Models
{
     public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ClientName { get; set; }
        public decimal EstimatedCost { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
        public int Progress { get; set; }
    }
}