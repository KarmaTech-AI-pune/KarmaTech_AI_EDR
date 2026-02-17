using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Domain.Entities
{
    public class WorkBreakdownStructure : ITenantEntity
    {
        public WorkBreakdownStructure()
        {
            Tasks = new List<WBSTask>();
            JobStartForms = new List<JobStartForm>();
        }

        public int Id { get; set; }
        public int TenantId { get; set; }
        public int WBSHeaderId { get; set; } // Foreign key to WBSHeader
        public string Structure { get; set; }
        public string Name { get; set; } // e.g., "Foundation", "Exterior"
        public string Description { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; }

        public WBSHeader WBSHeader { get; set; } // Navigation property
        public ICollection<WBSTask> Tasks { get; set; }
        public ICollection<JobStartForm> JobStartForms { get; set; }
    }
}

