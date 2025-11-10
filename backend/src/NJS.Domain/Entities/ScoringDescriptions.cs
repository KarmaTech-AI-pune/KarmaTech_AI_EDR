using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("ScoringDescription")]
    public class ScoringDescriptions : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }
        public string Label { get; set; }

        // Navigation property
        public virtual ICollection<ScoringDescriptionSummarry> ScoringDescriptionSummarry { get; set; }
    }
}
