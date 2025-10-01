using System.ComponentModel.DataAnnotations;

namespace NJS.Domain.Entities
{
    public class TodoNewTeamMember
    {
        [Key]
        public string? Assineid { get; set; }  // Primary Key (string for flexibility)

        public string? Assinename { get; set; }

        public string? Assineavatar { get; set; }
    }
}
