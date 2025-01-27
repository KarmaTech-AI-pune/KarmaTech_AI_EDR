using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class ProjectResource
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }
        
        [ForeignKey("ProjectId")]
        public Project Project { get; set; }

        [Required]
        public string UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal ProjectRate { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        // Additional properties for resource allocation
        public double AllocationPercentage { get; set; } = 100.0;
        
        public string Notes { get; set; }
    }
}
