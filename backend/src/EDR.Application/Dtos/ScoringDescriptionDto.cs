namespace EDR.Application.Dtos
{
    public class ScoringDescriptionDto
    {
        public Dictionary<string, ScoringLevelDescriptionDto> descriptions { get; set; }
    }

    public class ScoringLevelDescriptionDto
    {
        public string High { get; set; }
        public string Medium { get; set; }
        public string Low { get; set; }
    }
}

