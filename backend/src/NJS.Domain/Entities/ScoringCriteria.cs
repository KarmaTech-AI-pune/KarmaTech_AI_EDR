using System.ComponentModel.DataAnnotations;
using System.Web;

namespace NJS.Domain.Entities
{
    public  class ScoringCriteria
    {
        [Key]
        public int Id { get; set; }

        public string Label { get; set; }

        public string ByWhom { get; set; }
        public string ByDate { get; set; }
        public string Comments { get; set; }
        public int Score { get; set; }
        public bool? ShowComments { get; set; }

        public ICollection<GoNoGoDecisionOpportunity> GoNoGoDecisionOpportunities { get; set; } = [];
    }
}
