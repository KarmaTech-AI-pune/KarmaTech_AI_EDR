using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EDR.Domain.Entities
{
    [Table("ScoringDescriptionSummarry")]
    public class ScoringDescriptionSummarry : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }
        
        [ForeignKey("ScoringDescriptions")]
        public int ScoringDescriptionID { get; set; }
        
        public string High { get; set; }
        public string Medium { get; set; }
        public string Low { get; set; }

        // Navigation property
        public virtual ScoringDescriptions ScoringDescriptions { get; set; }
    }
}

