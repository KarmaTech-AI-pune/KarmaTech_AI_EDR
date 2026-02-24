using System.ComponentModel.DataAnnotations;

namespace EDR.Domain.Entities
{
    public class Region : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }

    }
}

