using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("ScoringDescriptionSummarry")]
    public class ScoringDescriptionSummarry
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey("ScoringDescriptions")]
        public int ScoringDescriptionID { get; set; }
        
        public string High { get; set; }
        public string Medium { get; set; }
        public string Low { get; set; }

        // Navigation property
        public virtual ScoringDescriptions ScoringDescriptions { get; set; }
    }
}
