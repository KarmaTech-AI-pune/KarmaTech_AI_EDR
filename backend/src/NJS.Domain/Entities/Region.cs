using System.ComponentModel.DataAnnotations;

namespace NJS.Domain.Entities
{
    public class Region
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }

    }
}
