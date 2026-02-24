using System.ComponentModel.DataAnnotations;

namespace EDR.Domain.Entities
{
    public class Settings : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }
        
        [Required]
        public string Key { get; set; }
        
        [Required]
        public string Value { get; set; }
        
        public string Description { get; set; }        
       
    }
}

