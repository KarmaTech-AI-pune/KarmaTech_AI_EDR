using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Entities
{
    public class OpportunityStatus
    {
        [Key]
        public int Id { get; set; }
        public string Status { get; set; }
        public ICollection<OpportunityHistory> OpportunityHistories { get; set; } = [];
    }
}
