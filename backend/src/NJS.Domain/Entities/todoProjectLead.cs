using System.ComponentModel.DataAnnotations;

namespace NJS.Domain.Entities
{
    public class todoProjectLead
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
    }
}
