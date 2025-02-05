using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Entities
{
    public class ScoringDescriptions
    {
        [Key]
        public int Id { get; set; }

        public string label { get; set; }

        public ICollection<ScoringDescriptionSummarry> ScoringDescriptionSummarry { get; set; } = [];
    }
}
