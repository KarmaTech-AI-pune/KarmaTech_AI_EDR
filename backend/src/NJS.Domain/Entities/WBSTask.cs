//File: backend/src/NJS.Domain/Entities/WBSTask.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Entities
{
    public class WBSTask
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Budget { get; set; }
        public List<string> Resources { get; set; }

        public WorkBreakdownStructure WorkBreakdownStructure { get; set; }

        // Many-to-many relationship with User
        public ICollection<UserWBSTask> UserWBSTasks { get; set; }
    }
}
