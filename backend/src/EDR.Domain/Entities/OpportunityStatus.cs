using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Domain.Entities
{
    public class OpportunityStatus : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }
        public string Status { get; set; }
        public ICollection<OpportunityHistory> OpportunityHistories { get; set; } = [];
    }
}

