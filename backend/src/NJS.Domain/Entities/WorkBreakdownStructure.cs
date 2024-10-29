using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Entities
{
    public class WorkBreakdownStructure
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string Structure { get; set; }
        public List<WBSTask> Tasks { get; set; }
    }
}
