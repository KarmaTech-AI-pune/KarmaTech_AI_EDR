using System.ComponentModel.DataAnnotations;

namespace NJS.Domain.Entities
{
    public class Settings
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Key { get; set; }
        
        [Required]
        public string Value { get; set; }
        
        public string Description { get; set; }        
       
    }
}
