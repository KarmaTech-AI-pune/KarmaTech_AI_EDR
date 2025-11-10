using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("JobStartFormSelections")]
    public class JobStartFormSelection : ITenantEntity
    {
        [Key]
        public int SelectionId { get; set; }

        public int TenantId { get; set; }

        [Required]
        public int FormId { get; set; } // Foreign key to JobStartForm

        [ForeignKey("FormId")]
        public virtual JobStartForm JobStartForm { get; set; }

        // Example properties for a selection/option
        public string OptionCategory { get; set; } // e.g., "Safety", "Resources", "Permits"
        public string OptionName { get; set; }
        public bool IsSelected { get; set; }
        public string Notes { get; set; }
    }
}
