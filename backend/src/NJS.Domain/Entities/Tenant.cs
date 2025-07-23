using System.ComponentModel.DataAnnotations;

namespace NJS.Domain.Entities
{
    public class Tenant
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; }

        [Required]
        [MaxLength(255)]
        public string Domain { get; set; }
    }
}
