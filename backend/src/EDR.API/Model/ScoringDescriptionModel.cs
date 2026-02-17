namespace EDR.API.Model
{
    public class ScoringDescriptionModel
    {

        
        public string Label { get; set; }

        public ScoringDescriptionListModel listModels { get; set; }
    }
    public class ScoringDescriptionListModel 
    {
        public string byWhom {get;set;}
        public string byDate {get;set;}
        public string comments {get;set;}
        public int score { get; set; } 
        public bool showComments {get; set; }
}
}

