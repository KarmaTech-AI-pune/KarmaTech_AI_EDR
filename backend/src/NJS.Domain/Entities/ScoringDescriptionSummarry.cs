
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace NJS.Domain.Entities
{
    public  class ScoringDescriptionSummarry
    {
        [Key]
        public int Id { get; set; }

        public int ScoringDescriptionID { get; set; }

        [ForeignKey("ScoringDescriptionID")]
        public ScoringDescriptions ScoringDescriptions { get; set; }
        public string High { get; set; }
        public string Medium { get; set; }
        public string Low { get; set; }

    }
}
