using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.Dtos.Dashboard
{
    public class MilestoneBillingDto
    {
        public int Id { get; set; }
        public string Project { get; set; }
        public string Milestone { get; set; }
        public decimal ExpectedAmount { get; set; }
        public string Status { get; set; }
        public int DaysDelayed { get; set; }
        public decimal Penalty { get; set; }
    }
}
