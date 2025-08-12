using System.ComponentModel.DataAnnotations;

namespace NJS.Domain.Entities
{
    public class todoProject
    {
        [Key]
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Location { get; set; }
        public string? WorkingHours { get; set; }

        public todoProjectLead? ProjectLead { get; set; }
    }
}
