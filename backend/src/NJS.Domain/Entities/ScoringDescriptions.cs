using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("ScoringDescription")]
    public class ScoringDescriptions
    {
        [Key]
        public int Id { get; set; }
        public string Label { get; set; }

        // Navigation property
        public virtual ICollection<ScoringDescriptionSummarry> ScoringDescriptionSummarry { get; set; }
    }
}
