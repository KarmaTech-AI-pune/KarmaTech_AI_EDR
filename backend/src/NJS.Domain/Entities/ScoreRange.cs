using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Entities
{
    public class ScoreRange
    {
        [Key]
        public int Id { get; set; }

        public int value { get; set; }


        public string label { get; set; }


        public string  range { get; set; }

        public ICollection<GoNoGoDecisionOpportunity> GoNoGoDecisionOpportunitiesScoring { get; set; } = [];
    }
}
