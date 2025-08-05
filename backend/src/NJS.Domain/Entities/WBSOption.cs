using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public enum FormType
    {
        Manpower = 0,
        ODC = 1
    }

    public class WBSOption : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        [StringLength(100)]
        public string Value { get; set; }

        [Required]
        [StringLength(255)]
        public string Label { get; set; }

        [Required]
        public int Level { get; set; }

        [StringLength(100)]
        public string ParentValue { get; set; }

        public FormType FormType { get; set; } = FormType.Manpower; // Default to Manpower for backward compatibility
    }
}
