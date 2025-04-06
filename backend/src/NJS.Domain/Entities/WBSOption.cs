using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class WBSOption
    {
        [Key]
        public int Id { get; set; }

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
    }
}
