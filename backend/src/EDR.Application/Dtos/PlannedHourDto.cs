namespace EDR.Application.Dtos
{
    public class PlannedHourDto
    {
        public int Year { get; set; }
        public string Month { get; set; } // e.g., "January", "February"
        public double PlannedHours { get; set; }
        // public double? ActualHours { get; set; } // Future enhancement
    }
}

